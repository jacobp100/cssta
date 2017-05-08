// @flow
/* eslint-disable no-param-reassign */
const postcss = require('../../vendor/postcss');
const selectorParser = require('postcss-selector-parser');
const { keyframesRegExp, isDirectChildOfKeyframes } = require('./index');

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

module.exports = (inputCss /*: string */, allowCombinators /*: boolean */ = false) => {
  // Allow @ or *
  const transformedInput = inputCss.replace(/(\[\s*)@(\w)/g, '$1*$2');
  const root = postcss.parse(transformedInput);

  iterateChildren(root, nestNode);

  const propTypes = {};
  const validateAndTransformSelectors = selectorParser((container) => {
    container.each((selector) => {
      let didScopeNode = false;

      selector.walk((node) => {
        if (node.type === 'combinator' && !allowCombinators) {
          throw new Error('Invalid use of combinator in selector');
        } else if (node.type === 'nesting') {
          didScopeNode = true;
        } else if (node.type === 'attribute' && node.attribute.trim()[0] === '*') {
          const isInNot =
            node.parent.parent.type === 'pseudo' && node.parent.parent.value === ':not';
          const nodeThatMustBeTiedToNesting = isInNot ? node.parent.parent.parent : node.parent;
          const isTiedToNesting =
            nodeThatMustBeTiedToNesting.nodes.some(child => child.type === 'nesting');

          if (!isTiedToNesting) {
            throw new Error('Prop selectors ([@prop]) must be scoped using an "&"');
          }

          const prop = node.attribute.trim().slice(1); // Remove *
          const propType = node.value ? 'oneOf' : 'bool';

          if (propType === 'oneOf' && node.operator !== '=') {
            throw new Error(`You cannot use operator ${node.operator} in a prop selector`);
          }

          if (propType === 'oneOf' && node.raws.insensitive) {
            throw new Error('You cannot use case-insensitive prop selectors');
          }

          if (prop === 'component') {
            throw new Error('You cannot name an prop "component"');
          }

          if (!(prop in propTypes)) {
            propTypes[prop] = { type: propType };
          } else if (propTypes[prop].type !== propType) {
            throw new Error(`Prop "${prop}" defined as both bool and a string`);
          }

          if (propType === 'oneOf') {
            const value = node.raws.unquoted.trim();
            propTypes[prop].values = (propTypes[prop].values || [])
              .concat(value)
              .reduce((accum, elem) => (
                accum.indexOf(elem) === -1 ? accum.concat(elem) : accum
              ), []);
          }
        }
      });

      if (!didScopeNode) {
        throw new Error('You must use "&" in every selector');
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
