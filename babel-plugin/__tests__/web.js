const { transform } = require("babel-core");
const plugin = require("..");

const getOutput = () => {
  const output = contents => {
    output.value = contents;
  };
  output.value = "";
  return output;
};

const run = (input, options) => {
  plugin.resetGenerators();
  const cssOutput = getOutput();
  const { code } = transform(input, {
    plugins: [[plugin, { output: cssOutput, ...options }]],
    babelrc: false
  });

  return { jsOutput: code, cssOutput: cssOutput.value };
};

test("Default", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component = cssta.button\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Empty rules", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component = cssta.button\`\`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Boolean attributes", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component = cssta.button\`
      &[@booleanAttribute] {
        color: red;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("String attributes", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component = cssta.button\`
      &[@stringAttribute = "1"] {
        color: red;
      }

      &[@stringAttribute = "2"] {
        color: blue;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Multiple attributes", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component = cssta.button\`
      color: red;

      &[@booleanAttribute] {
        color: green;
      }

      &[@stringAttribute = "1"] {
        color: blue;
      }

      &[@stringAttribute = "2"] {
        color: yellow;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Compose component", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';
    import Link from 'react-router';

    const Component = cssta(Link)\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Computed component", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const button = 'button';
    const Component = cssta[button]\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Multiple calls in file", () => {
  const { jsOutput, cssOutput } = run`
    import cssta from 'cssta';

    const Component1 = cssta.button\`
      color: red;
    \`;

    const Component2 = cssta.span\`
      color: green;
    \`;

    const Component3 = cssta.div\`
      color: blue;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Import under other name", () => {
  const { jsOutput, cssOutput } = run`
    import someOtherName from 'cssta';

    someOtherName.button\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("No imports", () => {
  const { jsOutput, cssOutput } = run`console.log('...');`;

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});

test("Single source of variables", () => {
  const contents = `
    import cssta from 'cssta';

    const Component1 = cssta.div\`
      --large: 100;
      --small: 50;
      --margin: var(--large) var(--small);

      width: var(--large);
    \`;

    const Component2 = cssta.div\`
      width: var(--small);
    \`;
  `;

  const { jsOutput, cssOutput } = run(contents, {
    optimizations: [["singleSourceOfVariables", { sourceContents: contents }]]
  });

  expect(jsOutput).toMatchSnapshot();
  expect(cssOutput).toMatchSnapshot();
});
