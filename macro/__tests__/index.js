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

      cssta('div')\`
        color: blue;
      \`
    `
  ]
});

pluginTester({
  plugin,
  snapshot: true,
  babelOptions: { filename: __filename },
  tests: [
    `
      import cssta from '../prod.macro'

      cssta('div')\`
        color: red;
      \`

      cssta('div')\`
        color: blue;
      \`
    `
  ]
});
