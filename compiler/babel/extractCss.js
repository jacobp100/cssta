module.exports = (babel, { quasis, expressions }) => {
  const substitutionNames = expressions.map(
    (value, index) => `__substitution-${index}__`
  );
  const cssText =
    quasis[0].value.cooked +
    substitutionNames
      .map((name, index) => name + quasis[index + 1].value.cooked)
      .join("");

  const substitutionMap = {};
  substitutionNames.forEach((substitution, index) => {
    substitutionMap[substitution] = expressions[index];
  });

  return { cssText, substitutionMap };
};
