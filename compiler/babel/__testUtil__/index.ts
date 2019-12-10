import * as babel from "@babel/core";
import generate from "@babel/generator";
import buildElement from "../buildElement";
import { Options } from "../../options";

const { types: t } = babel;

export const styled: { test: (x: TemplateStringsArray) => string } = {
  test: String.raw
} as any;

export const build = (css: string, options: Options = {}) => {
  const ast = babel.parse("const Example = 'replaceMe'");
  babel.traverse(ast, {
    StringLiteral(path: any) {
      if (path.node.value === "replaceMe") {
        buildElement(
          babel,
          path,
          t.identifier("Element"),
          t.templateLiteral([t.templateElement({ raw: css, cooked: css })], []),
          { jsx: true, ...options }
        );
      }
    }
  });
  const { code } = generate(ast);
  return code.replace(/"/g, "'");
};
