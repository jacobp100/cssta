const { transform } = require("babel-core");
const plugin = require("..");

const run = (input, options) => {
  plugin.resetGenerators();
  const { code } = transform(input, {
    plugins: [[plugin, options]],
    babelrc: false
  });

  return code;
};

test("Default", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Empty rules", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`\`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Boolean attributes", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta.button\`
      &[@booleanAttribute] {
        color: red;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("String attributes", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

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
});

test("Multiple attributes", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

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
});

test("Compose component", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import Link from 'react-router';

    const Component = cssta(Link)\`
      color: red;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Create within closure", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    function test() {
      return cssta(View)\`
        color: red;
      \`;
    }
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("CSS shorthands", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      margin: 0 10px;
      font: bold italic 12px/18px "Helvetica";
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("CSS color function", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      color: color(red l(+ 25%));
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Variables import", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      color: var(--color);
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Variables export", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      --color: red;

      &[@blue] {
        --color: blue;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Variables", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      --color: red;
      color: var(--color);
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("VariablesProvider", () => {
  const jsOutput = run`
    import cssta, { VariablesProvider } from 'cssta/native';
    import { View } from 'react-native';

    cssta(View)\`
      color: red;
    \`;

    VariablesProvider
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Variables CSS color function", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const Component = cssta(View)\`
      color: color(var(--red) l(+ 25%));
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Transitions", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      color: red;
      transition: color 1s linear;

      &[@boolAttr] {
        color: blue;
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Transitions with shorthand", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      background-color: #e74c3c;
      height: 20px;
      margin-bottom: 20px;
      transform: scaleX(1) rotate(0deg);
      transition: background-color 0.5s linear, transform 0.75s linear;

      &[@active] {
        background-color: #1abc9c;
        transform: scaleX(0.5) rotate(6deg);
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Transitions with variables", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      color: var(--primary);
      transition: color 1s linear;

      &[@boolAttr] {
        color: var(--secondary);
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Keyframes", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      color: red;
      animation: test 1s linear;

      @keyframes test {
        start { opacity: 0; }
        50% { opacity: 0.2; }
        end { opacity: 1; }
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Keyframes with variables", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      color: red;
      animation: test 1s linear;

      @keyframes test {
        start { color: rgba(0, 0, 0, 0); }
        end { color: var(--primary); }
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Keyframes without variables", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    cssta(Animated.View)\`
      color: var(--primary);
      animation: test 1s linear;

      @keyframes test {
        start { color: rgba(0, 0, 0, 0); }
        end { rgba: rgba(0, 0, 0, 1); }
      }
    \`
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Interpolation simple", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const color = 'red';

    cssta(View)\`
      &[@attr1] {
        margin-top: 10px;
        color: \${color};
      }

      &[@attr2] {
        color: \${color};
        margin-top: 10px;
      }

      &[@attr3] {
        margin-top: 10px;
        color: \${color};
        margin-bottom: 10px;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Interpolation in shorthand", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View } from 'react-native';

    const font = '10px "Helvetica"';

    cssta(View)\`
      &[@attr1] {
        margin-top: 10px;
        font: \${font};
      }

      &[@attr2] {
        font: \${font};
        margin-top: 10px;
      }

      &[@attr3] {
        margin-top: 10px;
        font: \${font};
        margin-bottom: 10px;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Interpolation with unit suffix", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View, StyleSheet } from 'react-native';

    cssta(View)\`
      border-bottom-width: \${StyleSheet.hairlineWidth}px;
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});

test("Interpolation complex", () => {
  const jsOutput = run`
    import cssta from 'cssta/native';
    import { View, StyleSheet } from 'react-native';

    const marginSmall = 10;
    const marginLarge = 10;

    cssta(View)\`
      &[@attr1] {
        padding-top: 10px;
        margin: \${marginLarge}px \${marginSmall}px;
      }

      &[@attr2] {
        margin: \${marginLarge}px \${marginSmall}px;
        padding-top: 10px;
      }

      &[@attr3] {
        padding-top: 10px;
        margin: \${marginLarge}px \${marginSmall}px;
        padding-bottom: 10px;
      }
    \`;
  `;

  expect(jsOutput).toMatchSnapshot();
});
