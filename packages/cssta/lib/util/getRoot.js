'use strict';

/* eslint-disable no-param-reassign */
var postcss = require('../../vendor/postcss');
var selectorParser = require('postcss-selector-parser');

var _require = require('./index'),
    keyframesRegExp = _require.keyframesRegExp,
    isDirectChildOfKeyframes = _require.isDirectChildOfKeyframes;

// Don't use root.each, because when we remove nodes, we'll skip them


var iterateChildren = function iterateChildren(root, callback) {
  var iterate = function iterate(node) {
    if (!node) return;
    var nextNode = node.next();
    callback(node);
    iterate(nextNode);
  };

  iterate(root.first);
};

var nestNode = function nestNode(node) {
  switch (node.type) {
    case 'decl':
      {
        var prevNode = node.prev();
        if (prevNode && prevNode.type === 'rule' && prevNode.selector === '&') {
          prevNode.append(node);
          node.remove();
        } else {
          var ruleNode = postcss.rule({ selector: '&' });
          ruleNode.append(node);
          node.replaceWith(ruleNode);
        }
        break;
      }case 'atrule':
      {
        if (!keyframesRegExp.test(node.name)) {
          iterateChildren(node, nestNode);
        }
        break;
      }default:
      break;
  }
};

var scopingTypes = ['nesting', 'attribute'];

module.exports = function (inputCss) {
  var allowCombinators = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var root = postcss.parse(inputCss);

  iterateChildren(root, nestNode);

  var propTypes = {};
  var validateAndTransformSelectors = selectorParser(function (container) {
    container.each(function (selector) {
      var didScopeNode = false;

      selector.walk(function (node) {
        if (node.type === 'combinator' && (!allowCombinators || didScopeNode)) {
          /* Allow `:fullscreen &`, or `.ie9 &`, or even `:fullscreen :hover` */
          /* But don't allow the reverse: `& .ie9`---that makes literally no sense */
          throw new Error('Invalid use of combinator in selector');
        }
        if (scopingTypes.indexOf(node.type) !== -1) {
          didScopeNode = true;
        }

        if (node.type === 'attribute') {
          var attribute = node.attribute.trim();
          var propType = node.value ? 'oneOf' : 'bool';

          if (propType === 'oneOf' && node.operator !== '=') {
            throw new Error('You cannot use operator ' + node.operator + ' in an attribute selector');
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
            throw new Error('Attribute "' + attribute + '" defined as both bool and a string');
          }

          if (propType === 'oneOf') {
            var value = node.raws.unquoted.trim();
            propTypes[attribute].values = (propTypes[attribute].values || []).concat(value).reduce(function (accum, elem) {
              return accum.indexOf(elem) === -1 ? accum.concat(elem) : accum;
            }, []);
          }
        }
      });

      if (!didScopeNode) {
        selector.append(selectorParser.nesting());
      }
    });
  });

  root.walkRules(function (rule) {
    if (!isDirectChildOfKeyframes(rule)) {
      rule.selector = validateAndTransformSelectors.process(rule.selector).result;
    }
  });

  return { root: root, propTypes: propTypes };
};