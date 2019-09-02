---
title: Introduction
layout: page
---

# [🌞 Cssta]({{ site.baseurl }})

Cssta is a styling system for [React Native 📱](https://facebook.github.io/react-native/) that lets you define components using CSS.

It takes heavy inspiration from [styled-components](https://github.com/styled-components/styled-components), but makes changes for readability 👀, to enable more features 🤙, and performance ⚡️.

Most notably, Cssta supports media queries, CSS animations and transitions, and CSS custom properties.

Performance-wise, Cssta compiles your CSS at compile time via a babel-plugin. Cssta is also able to perform [Svelte](https://svelte.dev)-like stripping of its framework, and is able to build many components with no Cssta runtime.

```jsx
import cssta from "cssta/native"

const BlueView = cssta(View)`
  background: blue;
`

const Example = <BlueView>I am a View with a blue background</BlueView>
```

This returns a regular React component, which when used, will have the styling applied.

Cssta can be used with its own babel plugin, or can use [babel-plugin-macros](https://www.github.com/kentcdodds/babel-plugin-macros).

You can install Cssta with,

```bash
npm install --save cssta
npm install --save-dev babel-plugin-cssta
```

In your React Native project, you’ll find a `babel.config.js` file. Edit this to read,

```diff
 module.exports = {
+  plugins: ['babel-plugin-cssta'],
   presets: ['module:metro-react-native-babel-preset'],
 };
```

### 🎣 Babel Plugin Macros

If you want to use babel-plugin-macros, change `babel-plugin-cssta` to `babel-plugin-macros`. You’ll then need to import the macro version of Cssta whenever you need to use it.

```diff
-import cssta from "cssta/native"
+import cssta from "cssta/native.macro"
```

## 📝 CSS

Cssta supports all the CSS React Native supports, and has the same syntax as your browser.

```css
font-size: 12px;
color: red;
```

There’s also support for short-hands.

```css
margin: 0px 5px; /* { marginTop: 0, marginRight: 5, ... } */
font: bold italic 12px/18px "Helvetica";
```

And support for more complicated attributes.

```css
shadow-offset: 10px 5px; /* { width: 10, height: 5 } */
font-variant: small-caps; /* ["small-caps"] */
transform: scale(3) rotate(30deg); /* [{ scale: 3 }, { rotate: "30deg" }] */
```

For more information, see [css-to-react-native](https://www.npmjs.com/package/css-to-react-native).

## 🎛 Props

We extend the attribute selector syntax in CSS. Now when your attribute name starts with an at symbol, we’ll query the React props. We call these _prop selectors_. You can use,

- `[@stringAttribute="stringValue"]` for string props
- `[@booleanAttribute]` for boolean props

You’ll always need the `&` selector when using prop selectors.

```jsx
const Message = cssta(Text)`
  padding: 6px 12px;

  &[@large] {
    padding: 12px 18px;
  }

  &:not([@noOutline]) {
    border: 1px solid grey;
  }

  &[@priority="critical"] {
    background-color: red;
  }
  &[@priority="important"] {
    background-color: orange;
  }
`

const Ex = <Message large>Large Button with an Outline</Message>
const Ex = <Message noOutline>Button with no Outline</Message>
const Ex = <Message priority="critical">Red Button with an Outline</Message>
const Ex = <Message priority="important">Orange Button with an Outline</Message>

const Ex = (
  <Message large noOutline priority="critical">
    Large, Red Button with no Outline
  </Message>
)
```

All properties defined in prop selectors are not passed down to the component—they’re really only for styling. All other props get passed down.

```jsx
const Button = cssta(View)`
  &[@large] {
    padding: 12px;
  }
`

const Example = (
  <Button large onClick={() => alert("clicked")}>
    onClick Prop Passed Down
  </Button>
)
```

## 💗 Composition

It is possible React components only when the component accepts the prop `className` for web, and `style` for React Native.

```jsx
import { Link } from "react-router"

const StyledLink = cssta(Link)`
  color: rebeccapurple;
  text-decoration: none;
`
```

It is also possible to compose your own components.

```jsx
const OutlineView = cssta(View)`
  padding: 6px 12px;
  border: 2px solid grey;
  border-radius: 1000px;
`

const RedOutlineView = cssta(OutlineView)`
  background-color: red;
`

const BlueOutlineView = cssta(OutlineView)`
  background-color: blue;
`
```

## 🖌 Overriding Styles

The properties `className` on web, and `style` on React Native have special behavior. They append styles to those already defined by the component.

```jsx
<Button style={% raw %}{{ marginRight: 0 }}{% endraw %}>
  Composing Styles
</Button>
```

## 🖥 Media Queries

These work just as they do in CSS. We support `min-` and `max-` `width` and `height`, as well as `orientation: portrait` and `orientation: landscape`. We also support a non-standard `platform`, which queries whatever `Platform.OS` returns.

```jsx
const Title = cssta(Text)`
  font-size: 12px;

  @media (min-width: 600px) {
    font-size: 24px;
  }
`
```

You can see more under [media queries]({{ site.baseurl }}/media-queries).

## 🏳️‍🌈 Theming

The best way to do theming in Cssta is by using [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_variables). Use them as in Cssta as you’d use them on the web, and they’ll just work

```jsx
const Inverted = cssta(View)`
  background-color: black;
  --primary: white;
`

const ThemedText = cssta(Text)`
  color: var(--primary, black);
  border: 1px solid var(--primary, black);
  padding: 6px 12px;
`

const Example = <ThemedText>I black text</ThemedText>
const Example = (
  <Inverted>
    <ThemedText>I am white text on a black background!</ThemedText>
  </Inverted>
)
```

There’s a few extra examples in [theming]({{ site.baseurl }}/theming).

## ✂️ Interpolation

In addition to CSS custom properties, you can use JavaScript’s `${value}` syntax to interpolate values. Note that you can only interpolate values or parts of values, and not entire rules or mixins. This is mostly useful for using platform constants.

```jsx
const Component = cssta(View)`
  border-bottom: ${StyleSheet.hairlineWidth}px solid grey;
`
```

See the [interpolation]({{ site.baseurl }}/interpolation) section.

## 🍿 Transitions and Animations

These also work just like CSS. For transitions, it’s as simple as,

```jsx
const Action = cssta(View)`
  opacity: 1;
  transition: opacity 300ms;

  [@disabled] {
    opacity: 0.5;
  }
`
```

Animations work too—you’ll need to put the keyframes in the component though.

```jsx
const ButtonWithKeyframes = cssta(Animated.View)`
  animation: fade-in 1s ease-in;

  @keyframes fade-in {
    0% {
      opacity: 0;
    }

    100% {
      opacity: 1;
    }
  }
`
```

You’ll find more information in the [transitions & animations]({{ site.baseurl }}/transitions-animations) section.

## 🤓 Refs

When using the `ref` prop, it will refer to the component you are styling rather than the styled component.

```jsx
const InnerRef = cssta(View)`
  background: red;
`

const Example = (
  <InnerRef
    ref={reactNativeViewElement => {
      /* Code here */
    }}
  />
)
```

See the documentation for [`React.forwardRef`](https://reactjs.org/docs/forwarding-refs.html) for more information.
