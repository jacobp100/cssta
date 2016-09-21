const fs = require('fs');
const path = require('path');
const _ = require('lodash/fp');
const cssta = require('cssta');
const cssNameGenerator = require('css-class-generator');

const classGenerator = cssNameGenerator();


module.exports = () => ({
  visitor: {
    ImportDeclaration(element, state) {
      if (element.node.source.value === 'cssta') {
        const defaultSpecifiers = _.flow(
          _.filter({ type: 'ImportDefaultSpecifier' }),
          _.map('local.name'),
          _.compact
        )(element.node.specifiers);

        const filename = state.file.opts.filename;
        state.csstaReferencesPerFile = _.update( // eslint-disable-line
          [filename],
          existingRefereces => _.concat(existingRefereces || [], defaultSpecifiers),
          state.csstaReferencesPerFile || {}
        );

        element.remove();
      }
    },
    CallExpression(element, state) {
      const { callee } = element.node;
      if (callee.type !== 'Identifier') return;

      const filename = state.file.opts.filename;
      const references = _.getOr([], [filename], state.csstaReferencesPerFile);

      if (references.indexOf(callee.name) === -1) return;

      const [cssNode] = element.node.arguments;
      let cssString = _.get(['quasis', 0, 'value', 'raw'], cssNode);
      if (!cssString) cssString = _.get('value', cssNode);
      if (!cssString) return;

      state.outputIndexPerFile = _.update( // eslint-disable-line
        [filename],
        index => (index || 0) + 1,
        state.outputIndexPerFile || {}
      );

      const index = _.get([filename], state.outputIndexPerFile);

      const cssFileName = path.resolve(process.cwd(), 'styles.css');
      let existingCss;

      try {
        existingCss = fs.readFileSync(cssFileName, 'utf-8');
      } catch (e) {
        existingCss = '/* File automatically generated */\n';
      }

      const commentMarker = `/* file: ${filename.replace(/\*/g, '')}, index: ${index} */`;

      if (existingCss.indexOf(commentMarker) !== -1) {
        throw new Error('You must remove the existing CSS file before running files through babel');
      }

      const { output, classNameMap } = cssta.transformClassNames(cssString, () => (
        classGenerator.next().value
      ));

      const outputCss = `${existingCss}\n${commentMarker}\n${output}`;

      fs.writeFileSync(cssFileName, outputCss, {
        encoding: 'utf-8',
        flag: 'w+',
      });

      if (_.isEmpty(classNameMap)) {
        element.remove();
      } else {
        element.replaceWithSourceString(JSON.stringify(classNameMap));
      }
    },
  },
});
