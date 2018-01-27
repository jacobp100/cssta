const fs = require("fs");
const path = require("path");
const { transform } = require("babel-core");
const macrosPlugin = require("babel-plugin-macros");
const babelPlugin = require("../../babel-plugin");

const run = input => {
  babelPlugin.resetGenerators();
  const { code } = transform(input, {
    plugins: [macrosPlugin],
    filename: __filename,
    babelrc: false
  });
  return code;
};

test("Development", () => {
  const jsCode = run`
    import cssta from '../dev.macro'

    cssta('div')\`
      color: red;
    \`

    cssta('div')\`
      color: blue;
    \`
  `;
  expect(jsCode).toMatchSnapshot();
});

test("Production", () => {
  const jsCode = run`
    import cssta from '../prod.macro'

    cssta('div')\`
      color: red;
    \`

    cssta('div')\`
      color: blue;
    \`
  `;
  expect(jsCode.replace(__dirname, "<dirname>")).toMatchSnapshot();
  const cssPath = path.join(__dirname, ".cssta-index.css");
  const css = fs
    .readFileSync(cssPath, "utf-8")
    .replace(__dirname, "<dirname>")
    .replace(__dirname, "<dirname>");
  expect(css).toMatchSnapshot();
  fs.unlinkSync(cssPath);
});
