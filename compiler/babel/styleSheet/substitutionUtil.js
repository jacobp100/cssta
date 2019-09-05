const getSubstitutionRegExp = substitutionMap => {
  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExp = new RegExp(
    `(${substititionNames.join("|")})`,
    "g"
  );
  return substitionNamesRegExp;
};
module.exports.getSubstitutionRegExp = getSubstitutionRegExp;

module.exports.containsSubstitution = (substitutionMap, value) =>
  Object.keys(substitutionMap).length !== 0 &&
  getSubstitutionRegExp(substitutionMap).test(value);

const getTemplateValues = cooked => ({
  cooked,
  raw: JSON.stringify(cooked).slice(1, -1)
});

module.exports.getStringWithSubstitutedValues = (
  { types: t },
  substitutionMap,
  value
) => {
  /* Don't attempt to optimise `${value}`: it converts to a string and we need that */
  const allValues =
    Object.keys(substitutionMap).length !== 0
      ? value.split(getSubstitutionRegExp(substitutionMap))
      : [value];
  const quasiValues = allValues.filter((_, i) => i % 2 === 0);
  const expressionValues = allValues.filter((_, i) => i % 2 === 1);

  if (expressionValues.length === 0) return t.stringLiteral(quasiValues[0]);

  const quasis = quasiValues.map((cooked, i) => {
    const isLast = i === quasiValues.length - 1;
    const templateValue = getTemplateValues(cooked);
    return isLast
      ? t.templateElement(templateValue)
      : t.templateElement(templateValue, true);
  });
  const expressions = expressionValues.map(value => substitutionMap[value]);

  return t.templateLiteral(quasis, expressions);
};
