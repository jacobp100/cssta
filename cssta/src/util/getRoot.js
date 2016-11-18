/* eslint-disable no-param-reassign */
const postcss = require('postcss');
const selectorParser = require('postcss-selector-parser');
const { keyframesRegExp, isDirectChildOfKeyframes } = require('.');

// Don't use root.each, because when we remove nodes, we'll skip them
const iterateChildren = (root, callback) => {
  const iterate = (node) => {
    if (!node) return;
    const nextNode = node.next();
    callback(node);
    iterate(nextNode);
  };

  iterate(root.first);
};

const scopingTypes = ['nesting', 'attribute'];


const nestNode = (node) => {
  switch (node.type) {
    case 'decl': {
      const prevNode = node.prev();
      if (prevNode && prevNode.type === 'rule' && prevNode.selector === '&') {
        prevNode.append(node);
        node.remove();
      } else {
        const ruleNode = postcss.rule({ selector: '&' });
        ruleNode.append(node);
        node.replaceWith(ruleNode);
      }
      break;
    } case 'atrule': {
      if (!keyframesRegExp.test(node.name)) {
        iterateChildren(node, nestNode);
      }
      break;
    } default:
      break;
  }
};

module.exports = (inputCss) => {
  const root = postcss.parse(inputCss);

  iterateChildren(root, nestNode);

  const propTypes = {};
  const validateAndTransformSelectors = selectorParser((container) => {
    container.each((selector) => {
      let didScopeNode = false;

      selector.walk((node) => {
        if (node.type === 'combinator') {
          throw new Error(`Invalid use of combinator: ${node.value}`);
        }
        if (scopingTypes.indexOf(node.type) !== -1) {
          didScopeNode = true;
        }

        if (node.type === 'attribute') {
          const attribute = node.attribute.trim();
          const propType = node.value ? 'oneOf' : 'bool';

          if (propType === 'oneOf' && node.operator !== '=') {
            throw new Error(`You cannot use operator ${node.operator} in an attribute selector`);
          }

          if (propType === 'oneOf' && node.raws.insensitive) {
            throw new Error('You cannot use case-insensitive attribute selectors');
          }

          if (attribute === 'component') {
            throw new Error('You cannot name an attribute "component"');
          }

          if (!(attribute in propTypes)) {
            propTypes[attribute] = { type: propType };
          } else if (propTypes[attribute].type !== propType) {
            throw new Error(`Attribute "${attribute}" defined as both bool and a string`);
          }

          if (propType === 'oneOf') {
            const value = node.raws.unquoted.trim();
            propTypes[attribute].values = (propTypes[attribute].values || [])
              .concat(value)
              .reduce((accum, elem) => (
                accum.indexOf(elem) === -1 ? accum.concat(elem) : accum
              ), []);
          }
        }
      });

      if (!didScopeNode) {
        selector.append(selectorParser.nesting());
      }
    });
  });

  root.walkRules((rule) => {
    if (!isDirectChildOfKeyframes(rule)) {
      rule.selector = validateAndTransformSelectors.process(rule.selector).result;
    }
  });

  return { root, propTypes };
};
