const { StyleSheet } = require('react-native');
const extractRules = require('./extractRules');
const { createValidatorForSelector } = require('./selectorTransform');

const assertNoTemplateParams = (otherAttributes) => {
  if (otherAttributes.length) {
    throw new Error('You cannot use string interpolation with cssta');
  }
};

module.exports = element => (cssText, ...otherAttributes) => {
  assertNoTemplateParams(otherAttributes);

  const { rules, styleSheetBody } = extractRules(cssText);

  const styleSheet = StyleSheet.create(styleSheetBody);

  const styles = rules.map(rule => ({
    validator: createValidatorForSelector(rule.selector),
    style: styleSheet[rule.styleName],
  }));

  return createComponent(element, styles);
};
