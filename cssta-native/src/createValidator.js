const { escapeRegExp } = require('lodash/fp');

const operatorToRegExp = {
  '=': base => `^${base}$`,
  '~=': base => `(?:^|\\s)${base}$(?:$|\\s)`,
  '|=': base => `^${base}$(?:$|-)`,
  '^=': base => `^${base}`,
  '$=': base => `${base}$`,
  '*=': base => base,
};

const createAttributeValidatorFunctionString = (node) => {
  const { attribute, operator, raws } = node;

  const baseRegExp = escapeRegExp(raws.unquoted.trim());

  if (!node.operator) return `props => props["${baseRegExp}"]`;

  const flags = raws.insensitive ? 'i' : '';

  return `(() => {
    const regExp = /${operatorToRegExp[operator](baseRegExp)}/${flags};
    return (props) => {
      const value = props[attribute];
      return value && regExp.test(value);
    };
  })()`;
};

const createAttributeValidator = (node) => {
  const { attribute, operator, raws } = node;

  if (!node.operator) return props => props[attribute];

  const baseRegExp = escapeRegExp(raws.unquoted.trim());
  const flags = raws.insensitive ? 'i' : '';
  const regExp = new RegExp(operatorToRegExp[operator](baseRegExp), flags);

  return (props) => {
    const value = props[attribute];
    return value && regExp.test(value);
  };
};

const createNotValidator = (node) => {

};

const validators = {
  attribute: createAttributeValidator,
};

const createValidator = (node) => {
  const { type } = node;

  if (!(type in validators)) {
    throw new Error(`Cannot create validator of type ${type}`);
  }

  return validators[type](node);
};
