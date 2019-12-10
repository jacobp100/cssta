import * as babel from "@babel/core";
import generate from "@babel/generator";
import styleBody from "../styleBody";
import { StyleTuple } from "../../../../runtime/cssUtil";
import { SubstitutionMap } from "../../extractSubstitutionMap";

const { types: t } = babel;

const run = (substitutionMap: SubstitutionMap, styleTuples: StyleTuple[]) => {
  const ast = babel.parse("const styles = () => {}");
  babel.traverse(ast, {
    ArrowFunctionExpression(path: any) {
      const node = styleBody(
        babel,
        path.get("body"),
        substitutionMap,
        styleTuples
      );
      path.get("body").pushContainer("body", t.returnStatement(node));
    }
  });
  const { code } = generate(ast);
  return code.replace(/"/g, "'");
};

it("Does not transform without substitutions", () => {
  const code = run({}, [["color", "red"]]);
  expect(code).toMatchInlineSnapshot(`
    "const styles = () => {
      return {
        color: 'red'
      };
    };"
  `);
});

it("Transforms string substitutions", () => {
  const code = run({ int1: t.identifier("color") }, [["color", "int1"]]);
  expect(code).toMatchInlineSnapshot(`
    "const styles = () => {
      return {
        color: String(color).trim()
      };
    };"
  `);
});

it("Transforms number substitutions", () => {
  const code = run({ int1: t.identifier("opacity") }, [["opacity", "int1"]]);
  expect(code).toMatchInlineSnapshot(`
    "const styles = () => {
      return {
        opacity: Number(opacity)
      };
    };"
  `);
});

it("Transforms length substitutions", () => {
  const code = run({ int1: t.identifier("top") }, [["top", "int1"]]);
  expect(code).toMatchInlineSnapshot(`
    "import { transformRawValue } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return {
        top: transformRawValue(top)
      };
    };"
  `);
});

it("Transforms shorthand values", () => {
  const code = run({ int1: t.identifier("margin") }, [["margin", "int1"]]);
  expect(code).toMatchInlineSnapshot(`
    "import { transformStyleTuples } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return transformStyleTuples([['margin', \`\${margin}\`]]);
    };"
  `);
});

it("Combines a simple value before a shorthand value", () => {
  const code = run(
    { int1: t.identifier("opacity"), int2: t.identifier("margin") },
    [
      ["opacity", "int1"],
      ["margin", "int2"]
    ]
  );
  expect(code).toMatchInlineSnapshot(`
    "import { transformStyleTuples } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return Object.assign({
        opacity: Number(opacity)
      }, transformStyleTuples([['margin', \`\${margin}\`]]));
    };"
  `);
});

it("Combines a simple value after a shorthand value", () => {
  const code = run(
    { int1: t.identifier("margin"), int2: t.identifier("opacity") },
    [
      ["margin", "int2"],
      ["opacity", "int1"]
    ]
  );
  expect(code).toMatchInlineSnapshot(`
    "import { transformStyleTuples } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return Object.assign(transformStyleTuples([['margin', \`\${opacity}\`]]), {
        opacity: Number(margin)
      });
    };"
  `);
});

it("Combines multiple simple values with a shorthand value", () => {
  const code = run(
    {
      int1: t.identifier("top"),
      int2: t.identifier("right"),
      int3: t.identifier("margin"),
      int4: t.identifier("color"),
      int5: t.identifier("left"),
      int6: t.identifier("border"),
      int7: t.identifier("opacity")
    },
    [
      ["top", "int1"],
      ["right", "int2"],
      ["margin", "int3"],
      ["color", "int4"],
      ["left", "int5"],
      ["border", "int6"],
      ["opacity", "int7"]
    ]
  );
  expect(code).toMatchInlineSnapshot(`
    "import { transformRawValue } from 'cssta/runtime/cssUtil';
    import { transformStyleTuples } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return Object.assign({
        top: transformRawValue(top),
        right: transformRawValue(right)
      }, transformStyleTuples([['margin', \`\${margin}\`]]), {
        color: String(color).trim(),
        left: transformRawValue(left)
      }, transformStyleTuples([['border', \`\${border}\`]]), {
        opacity: Number(opacity)
      });
    };"
  `);
});

it("Does not allow multiple values for simple properties", () => {
  expect(() => {
    run(
      {
        int1: t.identifier("color1"),
        int2: t.identifier("color2")
      },
      [["color", "int1 int2"]]
    );
  }).toThrow("Used multiple values color, which accepts one value");
});

it("Allows multiple values for shorthand properties", () => {
  const code = run(
    {
      int1: t.identifier("margin1"),
      int2: t.identifier("margin2")
    },
    [["margin", "int1 int2"]]
  );
  expect(code).toMatchInlineSnapshot(`
    "import { transformStyleTuples } from 'cssta/runtime/cssUtil';

    const styles = () => {
      return transformStyleTuples([['margin', \`\${margin1} \${margin2}\`]]);
    };"
  `);
});

it("Doesn't fail with empty substitution map", () => {
  expect(() => run({}, [["margin", "0"]])).not.toThrow();
});
