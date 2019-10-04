import { varRegExp } from "../../runtime/cssRegExp";
import { Options } from "./options";

export type SubstitutionMap = Record<string, any>;

export default (
  { quasis, expressions }: { quasis: any[]; expressions: any[] },
  options?: Options
) => {
  const substitutionNames = expressions.map(
    (_, index) => `__substitution-${index}__`
  );

  const quasiValue = (quasi: any) => {
    let value = quasi.value.cooked as string;

    if (options != null && options.globals != null) {
      value = value.replace(varRegExp, (fullMatch, variable, fallback) => {
        if (options.globals[variable] != null) {
          return options.globals[variable];
        } else if (fallback) {
          return fallback;
        } else if (!options.globalVarsOnly) {
          return fullMatch;
        } else {
          throw new Error(
            `Found variable "${variable}". This was not defined in the globals, and \`globalVarsOnly\` is enabled. See line with \`var(--${variable})\``
          );
        }
      });
    }

    return value;
  };

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
