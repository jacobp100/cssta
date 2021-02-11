import { SubstitutionMap } from "../extractSubstitutionMap";

export const getSubstitutionRegExp = (substitutionMap: SubstitutionMap) => {
  const substititionNames = Object.keys(substitutionMap);
  const substitionNamesRegExp = new RegExp(
    `(${substititionNames.join("|")})`,
    "g"
  );
  return substitionNamesRegExp;
};

export const containsSubstitution = (
  substitutionMap: SubstitutionMap,
  value: string
) =>
  Object.keys(substitutionMap).length !== 0 &&
  getSubstitutionRegExp(substitutionMap).test(value);

const getTemplateValues = (cooked: string) => ({
  cooked,
  raw: JSON.stringify(cooked).slice(1, -1),
});

export const getStringWithSubstitutedValues = (
  { types: t }: any,
  substitutionMap: SubstitutionMap,
  value: string
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
  const expressions = expressionValues.map((value) =>
    t.cloneDeep(substitutionMap[value])
  );

  return t.templateLiteral(quasis, expressions);
};
