---
layout: page
title: Native
permalink: /native
---

# 📱 Native

For React Native, you need to import `cssta/native`, and unlike the web version, there’s no `cssta.View` syntax. Other than that, it works as normal.

```jsx
import { cssta } from "cssta/native";
import { Text } from "react-native";

const StyledView = cssta(Text)`
  color: red;
`;
```

You’ll still want to run your code through the babel plugin, as we do a lot of optimisations. See [Production Builds]({{ site.baseurl }}/production-builds#-native) for how to do this.

## 📝 CSS Support

Cssta for React Native supports all the CSS React Native supports, and has the same syntax as your browser.

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
font-variant: small-caps; /* ['small-caps'] */
transform: scale(3) rotate(30deg); /* [{ scale: 3 }, { rotate: '30deg' }] */
```

For more information, see [css-to-react-native](https://www.npmjs.com/package/css-to-react-native).

## 🔍 Selectors

The only selectors supported on React Native are,

* Prop selectors (`[@boolAttribute]` and `[@stringAttribute="stringValue"]`)
* `:not(…)`
* `:matches(…)`

And these selectors work as normal.

```jsx
cssta(Text)`
  &[@color="red"] { ... }

  &:matches([@color="red"], [@color="blue"]) { ... }

  &:not([@allowOverflow]) { ... }
`;
```

Cssta for React Native does not use specificity: rules get applied in the order defined.

## 🎚 Polyfills

There are built-in polyfills for the following.

* Transitions and Animations (see below)
* CSS custom properties: `var(--property)`
* [CSS color function](https://drafts.csswg.org/css-color/#modifying-colors): `color(red tint(50%))`

## 📹 Transitions and Animations

Cssta has a lightweight wrapper for CSS transitions and animations. You’ll need to use a `Animated` component (usually `Animated.View`) for this, and then define these as you would in CSS.

```jsx
const ButtonWithTransition = cssta(Animated.View)`
  background-color: blue;
  color: white;

  transition:
    background-color 0.5s ease-in,
    color 0.7s ease-in;

  &[@disabled] {
    background-color: gray;
    color: light-gray;
  }
`;

const ButtonWithKeyframes = cssta(Animated.View)`
  animation: fade-in 1s ease-in;

  @keyframes fade-in {
      0% { opacity: 0; }
    100% { opacity: 1; }
  }
`;
```

You can even use CSS custom properties!

```jsx
const ButtonWithVariablesTransition = cssta(Animated.View)`
  color: var(--primary);
  transition: color 1s;
`;
```

Check the [React Native documentation](https://facebook.github.io/react-native/docs/animations.html) for what you can and can’t animate.

⚠️ We aren’t a full-blown CSS engine, so there are a few caveats—but these shouldn’t affect you too much.

Both the `animation` and `transition` properties must use shorthand notation: you can’t split it into separate parts like `animation-name`.

You can animate multiple transforms, but the nodes of the transform must not change. I.e, you can animate `transform: scaleX(1) rotateX(0deg)` to `transform: scaleX(5) rotateX(30deg)`, but you cannot then transform to `transform: scaleY(5) skew(30deg)`.

**Transitions** must have all transitioned properties defined in the top level (without a selector) so we know a default value to use. When transitioning shorthand properties, you’ll have to write each property name out individually in the `transition` property. This includes things like `border-width`, where you’ll have to write `transition: border-top-width border-right-width … 1s`.

**Animations** currently do not reset to their default values after the animation has elapsed: they will take the value they had at the end of the animation (like `animation-fill-mode: forwards`).

## 🎥 Custom Animations via `Animated.Value`

For more complicated animations, you’ll want to define all your non-changing styles in the usual way, and then pass your `Animated.Value`s in as style props.

```jsx
const BaseStyles = cssta(View)`
  height: 100px;
  width: 100px;
  background-color: red;
`

class AnimateOpacity extends Component {
  constructor() {
    super()

    this.state = {
      opacity: new Animated.Value(0)
    }
  }

  componentWillMount() {
    Animated.timing(this.state.opacity, {
      toValue: 1,
      duration: 1000,
    }).start()
  }

  render() {
    const { opacity } = this.state
    // Pass in your animated values here!
    return <BaseStyles style={% raw %}{{ opacity }}{% endraw %} />
  }
}
```

## 💉 Injecting Variables

You can use `VariablesProvider` to dynamically set variables. This accepts an `exportedVariables` property, which is a map of variables to inject.

```jsx
import { VariablesProvider } from 'cssta/native'

<VariablesProvider exportedVariables={% raw %}{{ color: 'red' }}{% endraw %}>
  <ComponentsThatUseColorVariable />
</Variables>
```

You can also pass a function for `exportedVariables`, which is called with an object of the parent scope.

```jsx
const getExportedVariables = (variablesFromScope) => {
  const { marginHorizontal, marginVertical } = variablesFromScope
  const margin = `${marginHorizontal} ${marginVertical}`
  return { margin }
}

<VariablesProvider exportedVariables={getExportedVariables}>
  <ComponentsThatUseColorVariable />
</Variables>
```
