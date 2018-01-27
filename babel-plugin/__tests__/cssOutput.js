const path = require("path");
const fs = require("fs");
const { transform } = require("babel-core");
const plugin = require("..");

const run = (input, filename, options) => {
  const { code } = transform(input, {
    plugins: [[plugin, { output: filename, preserveCssFile: true }]],
    babelrc: false,
    ...options
  });

  return code;
};

const teardown = filename => {
  const css = fs.readFileSync(filename, "utf-8");
  fs.unlinkSync(filename);
  return css;
};

test("Css output", () => {
  const filename = path.join(__dirname, "output1.css");
  plugin.resetGenerators();
  const jsOutput = run(
    `
      import cssta from 'cssta';

      const Component = cssta.button\`
        color: red;
      \`;
    `,
    filename
  );
  expect(jsOutput).toMatchSnapshot();
  expect(teardown(filename)).toMatchSnapshot();
});

test("Css output with multiple files", () => {
  const cssFilename = path.join(__dirname, "output2.css");
  plugin.resetGenerators();
  const jsOutput1 = run(
    `
      import cssta from 'cssta';

      const Component = cssta.button\`
        color: red;
      \`;
    `,
    cssFilename,
    { filename: "input1.js" }
  );
  const jsOutput2 = run(
    `
      import cssta from 'cssta';

      const Component = cssta.button\`
        color: blue;
      \`;
    `,
    cssFilename,
    { filename: "input2.js" }
  );

  expect(jsOutput1).toMatchSnapshot();
  expect(jsOutput2).toMatchSnapshot();
  expect(teardown(cssFilename)).toMatchSnapshot();
});

test("Css output overwriting files", () => {
  const cssFilename = path.join(__dirname, "output2.css");
  plugin.resetGenerators();
  const jsOutput1 = run(
    `
      import cssta from 'cssta';

      const Component = cssta.button\`
        color: red;
      \`;
    `,
    cssFilename,
    { filename: "input1.js" }
  );
  const jsOutput2 = run(
    `
      import cssta from 'cssta';

      const Component = cssta.button\`
        color: blue;
      \`;
    `,
    cssFilename,
    { filename: "input1.js" }
  );

  expect(jsOutput1).toMatchSnapshot();
  expect(jsOutput2).toMatchSnapshot();
  expect(teardown(cssFilename)).toMatchSnapshot();
});

test("Css output overwriting files with multiple files", () => {
  const cssFilename = path.join(__dirname, "output3.css");
  plugin.resetGenerators();
  const jsOutput1 = run(
    `
      import cssta from 'cssta';
      const Component = cssta.button\`color: red;\`;
    `,
    cssFilename,
    { filename: "input1.js" }
  );
  run(
    `
      import cssta from 'cssta';
      const Component = cssta.button\`color: yellow;\`;
    `,
    cssFilename,
    { filename: "input2.js" }
  );
  const jsOutput3 = run(
    `
      import cssta from 'cssta';
      const Component = cssta.button\`color: green;\`;
    `,
    cssFilename,
    { filename: "input3.js" }
  );
  const jsOutput2 = run(
    `
      import cssta from 'cssta';
      const Component = cssta.button\`color: blue;\`;
    `,
    cssFilename,
    { filename: "input2.js" }
  );

  expect(jsOutput1).toMatchSnapshot();
  expect(jsOutput2).toMatchSnapshot();
  expect(jsOutput3).toMatchSnapshot();
  // Should not move contents of input2
  expect(teardown(cssFilename)).toMatchSnapshot();
});
