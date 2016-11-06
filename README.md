# CSSTA

```
npm install --save cssta
npm install --save-dev babel-plugin-cssta
```

Experimental project very similar in concept to [styled components](https://styled-components.com). The main difference is that we focus on generating a **real CSS file**. The API is mostly the same, but different compromises were made (see below).

| | CSSTA | Styled Components |
| --- | --- | --- |
| Scopes class names | :white_check_mark: | :white_check_mark: |
| Scopes animation names | :white_check_mark: | :white_check_mark: |
| Other @-rules (@supports, @media) | :white_check_mark: | :white_check_mark: |
| Automatic prop validation | :white_check_mark: | :x: |
| Autoprefixer | :white_check_mark: (manual setup required) | :white_check_mark: (built-in) |
| Real CSS File | :white_check_mark: | :x: |
| JS overhead | ~1kb | A lot |
| Server rendering | :white_check_mark: | :white_check_mark: (at cost of file size) |
| React Native | :x: | :white_check_mark: |

# Usage

The API is very similar to styled components, so if things look similar, it's because they are.

CSSTA provides factory methods to make styled elements. To make a styled button, it's very simple.

```js
import cssta from 'cssta';

const Button = cssta.button`
  background: blue;
  color: white;
`;
```

This returns a regular React component, than can be used normally.

```js
<Button>Test</Button>
```

You can add pseudo-selectors by just writing a pseudo-selector class, which will be scoped only to the element you are creating. (You can also write `&:hover` if you prefer).

```js
const Button = cssta.button`
  background: blue;
  color: white;

  :hover {
    background: red;
  }
`;

<Button>Hover Me</Button>
```

A lot of your components will want variants: for example, being able to make a large button, or setting the colour of the button. To specify the variants, we use CSS attribute selectors: `[property="value"]` for string attributes and `[property]` and `:not([property])` for boolean values. The variants are exposed through props on the returned React component, and we allow the string and boolean values stated previously.

Note that one variant can either only be string values, or only be boolean (no mixing).

```js
const Button = cssta.button`
  /* Boolean */
  [large] {
    font-size: 2em;
  }

  /* String */
  [color="red"] {
    color: red;
  }
  [color="green"] {
    color: green;
  }
`;

<Button>Regular Button</Button>
<Button large>Large Button</Button>
<Button color="red">Red Button</Button>
<Button large color="green">Large Green Button</Button>
```

## @-Rules

Animations defined within a component are scoped to the element you are creating.

```js
const Button = cssta.button`
  animation: 1s scoped-animation;

  @keyframes scoped-animation {
    0% { opacity: 0; }
  }
`;
```

Other than keyframes, all other `@`-rules work as usual.

```js
const Button = cssta.button`
  font-size: 12pt;

  @media (max-width: 768px) {
    font-size: 12pt;
  }

  @supports (background: linear-gradient(to bottom, red, green)) {
    [christmas] {
      background: linear-gradient(to bottom, red, green);
    }
  }
`
```

## Composition

Like in styled components, you can compose components to style them.

```js
import { Link } from 'react-router';

const StyledLink = cssta(Link)`
  color: red;
`;
```

**Note you cannot compose a styled components**. We'll probably expost a postCSS pipeline so you can use your own plugins, and get composition through that.

```js
// NOT WORKING
const Button = cssta.button`color: red;`;
const LargeButton = cssta(Button)`font-size: large`;
```

## Globals

If you need to define some globals: be it default styling for tags (`body`, `h1` etc), CSS variables, or global animation keyframes, you can use `cssta.injectGlobal`, which prepends CSS. Note that you can only call this once.

```js
cssta.injectGlobal`
  body {
    margin: 1em;
  }
  
  @keyframes fade-in {
    0% { opacity: 0; }
  }
`;

const Button = cssta.button`
  animation: 1s fade-in;
`;
```

## Other Bits

All properties except for the ones defined as variants in your CSS, and `component` are passed down to the component you are styling. This allows you to define `style` and `className`.

However, note that `className` will add additional classes, but you cannot remove the classes otherwise set by the component. For classes, it is your responsibility to resolve the specifity: I recommend you only add util classes, and each declaration in those util classes uses `!important` for everything.

```js
<Button className="margin-right-1">Composing Classes</Button>
<Button style={{ marginRight: 0 }}>Composing Styles</Button>
```

If you need to override the element tag for the component, you can set the `component` property.

```js
<Button component="span">I am a span</Button>
```

## PostCSS

This was designed around the ida that you'll use postCSS to enhance your CSS. You'll almost certainly want to use autoprefixer. However, there are also plugins that will help you with composition, such as `postcss-simple-extend`.

In production, you'll have to run the CSS file from the babel-plugin through your own css pipeline.

In development, you can call `cssta.setPostCssPipeline` for any plugins that you need for development, but **make sure that you do not include these plugins or the `setPostCssPipeline` call in production!** One way to do this is to put the stuff required to bootstrap in one file, and get webpack to ignore that file.

```js
// bootstrap-cssta.js
import cssta from 'cssta';
import postcssSimpleExtend from 'postcss-simple-extend';

cssta.setPostCssPipeline([
  postcssSimpleExtend(),
]);
```

Using this plugin is otherwise straight-forward.

```js
cssta.injectGlobal(`
  @define-placeholder reset-button {
    background: none;
    border: none;
    border: 0;
    font-size: 1rem;
  }
`);

const Button = cssta.button`
  & {
    /* We have to wrap the @extend in a & selector */
    @extend reset-button;
  }
`;
```

# Babel Plugin

The cssta module was designed to work in a development environment, and you don't want to use it in production. You should use `babel-plugin-cssta` to extract the CSS from the cssta calls, add it to a CSS file, and replace the cssta call with a call that directly creates React components using the class names in the CSS file.

You can transform multiple files, and the CSS will be concatenated. However, **before you run babel, you must delete the existing CSS file** so you don't end up with duplicate CSS.

```js
{
  "plugins" [
    ["babel-plugin-cssta", {
      "output": "dist/styles.css"
    }]
  ]
}
```

The output is relative to your current working directory.

### In

```js
const Button = cssta.button`
  color: black;

  [large] {
    font-size: 18pt;
  }
`;
```

### Out

```js
import createComponent from 'cssta/lib/createComponent';
const Button = createComponent('button', '.A', {large:'.B'}); // Uses internal representation of class semantics
```

### CSS

```css
/* File generated by babel-plugin-cssta */

.A {
  color: black;
}

.B {
  font-size: 18pt;
}
```

# Demo and Building

See `cssta-demo`

* Run `npm start` for dev mode.
* Run `npm run build-cssta` for prod build, and see output JS and CSS files in `./dist`.
