export type SubstitutionMap = Record<string, any>;

const quasiValue = (quasi: any) => quasi.value.cooked as string;

export default ({
  quasis,
  expressions
}: {
  quasis: any[];
  expressions: any[];
}) => {
  const substitutionNames = expressions.map(
    (_, index) => `__substitution-${index}__`
  );

  const cssText =
    quasiValue(quasis[0]) +
    substitutionNames
      .map((name, index) => name + quasiValue(quasis[index + 1]))
      .join("");

  const substitutionMap = {} as SubstitutionMap;
  substitutionNames.forEach((substitution, index) => {
    substitutionMap[substitution] = expressions[index];
  });

  return { cssText, substitutionMap };
};
