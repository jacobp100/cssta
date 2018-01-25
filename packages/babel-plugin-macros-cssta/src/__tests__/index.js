const pluginTester = require("babel-plugin-tester");
const plugin = require("babel-plugin-macros");

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: { filename: __filename },
  tests: [
    `
      import cssta from '../dev.macro'

      cssta('div')\`
        color: red;
      \`
    `
  ]
});
