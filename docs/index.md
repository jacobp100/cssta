---
title: Introduction
layout: page
---

# [🌞 Cssta](./)

Cssta is a way to co-locate your CSS with your React components, and lets you define components using isolated units of style.

It is available both for [React for web 🌍](./web.md) and [React Native 📱](./native.md). For web, it generates **real CSS files** with **<1kb JS overhead**.

There’s also a tonne of stuff for React Native, including CSS transitions and CSS custom properties.

It is almost identical in concept to [styled-components](https://github.com/styled-components/styled-components), but makes different trade-offs.

```jsx
import cssta from 'cssta'

const Button = cssta.button`
  background: blue;
  color: white;
`

<Button>I am a blue button with white text</Button>
```

This returns a regular React component, which when used, will have the styling applied.

You can install Cssta with,

```bash
npm install --save cssta
npm install --save-dev babel-plugin-cssta
```

Note that while we are using template strings, interpolation (`${value}`) is not supported on web, but is supported for React Native. There are also other platform differences documented in the individual guides.

## 📝 CSS

The CSS input is regular CSS—but you should look at the platform guides for more information. You’ve also got the following,

* `&` to refer to the current component (you’ll need this in every selector)
* `[@attribute]` and `[@attribute="value"]` to query React props (see below)

## 🎛 Props

We extend the attribute selector syntax in CSS. Now when your attribute name starts with an at symbol, we’ll query the React props instead of the DOM element’s. You can use `[@stringAttribute="stringValue"]` for string props, and `[@booleanAttribute]` for boolean props. We call this a prop selector.

```jsx
const Button = cssta.button`
  padding: 0.5em 1em;

  &[@large] {
    font-size: 2em;
  }

  &:not([@noOutline]) {
    border: 1px solid currentColor;
  }

  &[@priority="critical"] {
    color: red;
  }
  &[@priority="important"] {
    color: orange;
  }
`

<Button large>Large Button with an Outline</Button>
<Button noOutline>Button with no Outline</Button>
<Button priority="critical">Red Button with an Outline</Button>
<Button priority="important">Orange Button with an Outline</Button>

<Button large noOutline priority="critical">
  Large, Red Button with no Outline
</Button>
```

All properties defined in prop selectors are not passed down to the component—they’re really only for styling. All other props get passed down.

```jsx
const button = `
  &[@large] { font-size: 12pt; }
`

<Button large onClick={() => alert('clicked')}>
  onClick Prop Passed Down
</Button>
```

In addition, we’ll automatically type check all your prop selectors with React’s `propTypes` to check for typos.

## 💗 Composition

It is possible React components only when the component accepts the prop `className` for web, and `style` for React Native.

```jsx
import { Link } from 'react-router'

const StyledLink = cssta(Link)`
  color: rebeccapurple;
  text-decoration: none;
`
```

It is also possible to compose your own components.

```jsx
const OutlineButton = cssta.button`
  padding: 0.5rem 1rem;
  border: 2px solid currentColor;
  border-radius: 1000px;
`

const RedButton = cssta(OutlineButton)`
  color: red;
`

const BlueButton = cssta(OutlineButton)`
  color: blue;
`
```

**For the moment, this only works when the components get defined in the same file!**

## 🏳️‍🌈 Theming

The best way to do theming in Cssta is by using [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). **We provide polyfills for React Native**, so these will just work. On the web, you can either rely on native browser support, or [a postCSS plugin](https://github.com/MadLittleMods/postcss-css-variables).

```jsx
const LightBox = cssta.div`
  background-color: black;
  --primary: white;
`

const Button = cssta.button`
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.5rem 1rem;
`

const Example = (
  <LightBox>
    <Button>I am white on black!</Button>
  </LightBox>
)
```

There’s a few extra examples in [theming](./theming.md).

## 🖌 Overriding Styles

The properties `className` on web, and `style` on React Native have special behavior. They append styles to those already defined by the component.

```jsx
// Web only
<Button className="margin-right-1">
  Composing Classes
</Button>

// Web and React Native
<Button style={% raw %}{{ marginRight: 0 }}{% endraw %}>
  Composing Styles
</Button>
```

When doing this on the web, watch out for specificity conflicts!

## ✂️ Overriding the Component

You can define `component` property on any Cssta elements to override the base component.

```jsx
const Div = cssta.div`
  background: red;
`

<Div component="span">I am a span now</Div>
```
