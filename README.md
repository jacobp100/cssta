# 🌞 CSSTA

# [Docs](https://jacobp100.gitbooks.io/cssta/content/)

CSSTA is a way to co-locate your CSS with your React components, and lets you define components using isolated units of style.

It is available both for [React for web 🌍](https://jacobp100.gitbooks.io/cssta/content/web.html) and [React Native 📱](https://jacobp100.gitbooks.io/cssta/content/native.html). It generates **real CSS files** for web.

It is almost identical in concept to [styled-components](https://github.com/styled-components/styled-components), but makes different trade-offs.

```js
import cssta from 'cssta';

const Button = cssta.button`
  background: blue;
  color: white;
`;

<Button>I am a blue button with white text</Button>
```

This returns a regular React component, which when used, will have the styling applied.

Note that while we are using template strings, interpolation (`${value}`) is not supported on web, but is supported for React Native. There are also other platform differences documented in the individual guides.

## 📝 CSS

The CSS input is *mostly* regular CSS—but you should look at the platform guides for more information.

However, selectors are changed on all platforms: only the following selector parts are permitted:

* `&` to refer to the current component
* `:hover`, `::before`, `:not(...)`, `:nth-child(...)` etc. pseudo selectors (platform dependent)
* `[attribute]` and `[attribute="value']` (these refer to React Props—see below)

Combinators (`a b`, `a > b` etc.) are not permitted.

## 🎛 Props

Attribute selectors have their meaning redefined to refer to React props. Defined as `[stringAttribute="stringValue"]` for string props, and `[booleanAttribute]` for boolean props, these apply conditional styling.

```js
const Button = cssta.button`
  padding: 0.5em 1em;

  [large] {
    font-size: 2em;
  }

  :not([noOutline]) {
    border: 1px solid currentColor;
  }

  [priority="critical"] {
    color: red;
  }
  [priority="important"] {
    color: orange;
  }
`;

<Button large>Large Button with an Outline</Button>,
<Button noOutline>Button with no Outline</Button>,
<Button priority="critical">Red Button with an Outline</Button>,
<Button priority="important">Orange Button with an Outline</Button>,

<Button large noOutline priority="critical">
  Large, Red Button with no Outline
</Button>
```

Note that only the attribute formats shown are valid: `[value~="invalid" i]` is invalid.

The properties you defined in the CSS determine the style applied, and are not passed down to the base component. All other props get passed down.

```js
const button = `
  [large] { font-size: 12pt; }
`;

<Button large onClick={() => alert('clicked')}>
  onClick Prop Passed Down
</Button>;
```

The properties defined in your CSS are type checked with `propTypes` to check for typos.

## 💗 Composition

It is possible React components only when the component accepts the prop `className` for web, and `style` for React Native.

```js
import { Link }  from 'react-router';

const StyledLink = cssta(Link)`
  color: rebeccapurple;
  text-decoration: none;
`;
```

It is also possible to compose your own components.

```js
const OutlineButton = cssta.button`
  padding: 0.5rem 1rem;
  border: 2px solid currentColor;
  border-radius: 1000px;
`;

const RedButton = cssta(OutlineButton)`
  color: red;
`;

const BlueButton = cssta(OutlineButton)`
  color: blue;
`;
```

**Note that for the moment, this only works when the components get defined in the same file!**

## 🖌 Overriding Styles

The properties `className` on web, and `style` on React Native have special behavior. They append styles to those already defined by the component.

```js
// Web only
;<Button className="margin-right-1">
  Composing Classes
</Button>

// Web and React Native
<Button style={{ marginRight: 0 }}>
  Composing Styles
</Button>
```

Note that you cannot remove the classes otherwise set by the component.

For class names, it is your responsibility to resolve the specificity. I recommend you only add util classes, and each declaration in those util classes uses `!important` for everything.

## ✂️ Overriding the Component

You can define `component` property on any Cssta elements to override the base component.

```js
const Div = cssta.div`
  background: red;
`;

<Div component="span">I am a span now</Div>
```

