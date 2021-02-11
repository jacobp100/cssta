import postcss, { AtRule, Root } from "postcss";
import { varRegExp } from "../../runtime/cssRegExp";
import { Options } from "../options";

export type Globals = {
  vars: Map<string, Set<number>>;
  conditions: {
    query: string | undefined;
    values: Map<string, string>;
  }[];
  globalVarsOnly: boolean;
};

export const parseGlobals = (
  input: Record<string, string> | string,
  { globalVarsOnly = false } = {}
): Globals => {
  if (input == null) {
    return { vars: new Map(), conditions: [], globalVarsOnly };
  } else if (typeof input === "object") {
    return {
      vars: new Map(Object.keys(input).map((v) => [v, new Set([0])])),
      conditions: [
        { query: undefined, values: new Map(Object.entries(input)) },
      ],
      globalVarsOnly,
    };
  }

  const root = postcss.parse(input);

  const atRules: AtRule[] = [];
  root.walkAtRules("media", (atRule) => atRules.push(atRule));

  const vars = new Map<string, Set<number>>();
  const conditions = [
    { query: undefined, values: new Map() },
    ...atRules.map((atRule) => ({
      query: atRule.params,
      values: new Map(),
    })),
  ];

  root.walkDecls((decl) => {
    const prop = decl.prop.slice("--".length);

    let conditionIndex = 0;
    if (decl.parent.type === "atrule" && decl.parent.name === "media") {
      conditionIndex = atRules.indexOf(decl.parent) + 1;
    }

    conditions[conditionIndex].values.set(prop, decl.value);

    if (!vars.has(prop)) vars.set(prop, new Set());
    vars.get(prop).add(conditionIndex);
  });

  return { vars, conditions, globalVarsOnly };
};

export const applyGlobals = (root: Root, globals: Globals) => {
  root.walkRules((rule) => {
    const conditionProps = new Map<number, string>();

    rule.walkDecls((decl) => {
      Array.from((decl.value as any).matchAll(varRegExp)).forEach(
        (match: string[]) => {
          const conditions = globals.vars.get(match[1]);
          if (conditions == null) return;
          conditions.forEach((cond) => {
            conditionProps.set(cond, decl.prop);
          });
        }
      );
    });

    // Sorted backwards
    // We add the at rules directly after the rule, so the last needs to be added first
    const conditionIndicies = Array.from(conditionProps.keys()).sort(
      (a, b) => b - a
    );

    conditionIndicies.forEach((index) => {
      const { query, values } = globals.conditions[index];

      const ruleCopy = rule.clone();
      let didEdit = false;

      const replaceVars = (value: string) =>
        value.replace(varRegExp, (fullMatch, variable, fallback) => {
          didEdit = true;
          if (values.has(variable)) {
            return values.get(variable);
          } else if (fallback) {
            return fallback;
          } else if (!globals.globalVarsOnly) {
            return fullMatch;
          } else {
            throw new Error(
              `Found variable "${variable}". This was not defined in the globals, and \`globalVarsOnly\` is enabled. See line with \`var(--${variable})\``
            );
          }
        });

      ruleCopy.walkDecls((decl) => {
        decl.value = replaceVars(decl.value);
      });

      if (!didEdit) return;

      if (query === undefined) {
        rule.replaceWith(ruleCopy);
      } else if (rule.parent.type === "atrule") {
        const params = rule.parent.params
          .split(",")
          .map((rule) => `${rule} and ${query}`)
          .join(",");
        const atRule = postcss.atRule({ name: "media", params });
        atRule.append(ruleCopy);
        rule.parent.parent.insertAfter(rule.parent, atRule);
      } else {
        /*
        We do actually have to clone the whole rule for cases like

        border: 0px solid var(--color);
        border-top: 1px;
        border-bottom: 1px;

        Otherwise we'd reset the top and bottom width

        It's also more performant to copy the whole style, as a later stage
        optimises for this exact case
        */
        const atRule = postcss.atRule({ name: "media", params: query });
        atRule.append(ruleCopy);
        rule.parent.insertAfter(rule, atRule);
      }
    });
  });
};

export default (root: Root, options: Options) =>
  applyGlobals(root, parseGlobals(options.globals, options));
