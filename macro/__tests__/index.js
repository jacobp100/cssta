const fs = require("fs");
const path = require("path");
const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: { filename: __filename },
  tests: [
    {
      title: "Development",
      code: `
        import cssta from '../dev.macro'

        cssta('div')\`
          color: red;
        \`

        cssta('div')\`
          color: blue;
        \`
      `
    },
    {
      title: "Production",
      code: `
        import cssta from '../prod.macro'

        cssta('div')\`
          color: red;
        \`

        cssta('div')\`
          color: blue;
        \`
      `,
      teardown() {
        const cssPath = path.join(__dirname, ".cssta-index.css");
        const css = fs.readFileSync(cssPath, "utf-8");
        expect(css).toMatchSnapshot();
        fs.unlinkSync(cssPath);
      }
    }
  ]
});
