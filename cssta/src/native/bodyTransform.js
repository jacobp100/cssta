/* eslint-disable no-param-reassign */
const camelizeStyleName = require('fbjs/lib/camelizeStyleName');

const numberUnitRegExp = /(\d+(\.\d*)?\w*)/g;
const functionsRegExp = /\w+\([^)]*\)/g;
const functionRegExp = /(\w+)\(\s*(.*?)\s*\)/;

const transformRawValue = input => (
  (input !== '' && !isNaN(input))
    ? Number(input)
    : input
);

const transformPropertyShorthands = {
  scale: ['scaleX', 'scaleY'],
  skew: ['skewX', 'skewY'],
  translate: ['translateX', 'translateY'],
};

const transforms = {
  fontWeight: String,
  fontVariant: input => input.split(/\s+/),
  shadowOffset: (input) => {
    const matches = input.match(numberUnitRegExp) || [];
    const [width = 0, height = width] = matches.map(Number);
    return { width, height };
  },
  transform: (input) => {
    const functionStrings = input.match(functionsRegExp) || [];
    const transform = functionStrings.reduce((accum, functionString) => {
      const [/* complete-match */, name, arg] = functionString.match(functionRegExp);

      let value;
      if (name in transformPropertyShorthands) {
        const functionNames = transformPropertyShorthands[name];
        const functionArguments = arg.match(numberUnitRegExp) || [];
        const lastFunctionArgument = functionArguments[functionArguments.length - 1];
        value = functionNames.map((shorthandName, index) => ({
          [shorthandName]: transformRawValue(functionArguments[index] || lastFunctionArgument),
        }));
      } else {
        value = { [name]: transformRawValue(arg) };
      }

      return accum.concat(value);
    }, []).reverse();
    // Reverse, because React-Native does it backwards to CSS
    return transform;
  },
};

module.exports = nodes => nodes.reduce((style, node) => {
  if (node.type === 'decl') {
    const propName = camelizeStyleName(node.prop);

    const { value } = node;
    const propValue = (propName in transforms)
      ? transforms[propName](value)
      : transformRawValue(value);

    style[propName] = propValue;
  } else {
    /* eslint-disable no-console */
    console.warn(`Node of type ${node.type} not supported as an inline style`);
  }

  return style;
}, {});
