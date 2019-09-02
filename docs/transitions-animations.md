---
layout: page
title: Transitions and Animations
permalink: /transitions-animations/
---

<style>
.note {
  color: #EA2027;
  font: 10pt/12pt 'Source Code Pro', monospace;
}

.feature-table {
  width: 100%;
  font: 10pt/12pt 'Source Code Pro', monospace;
}

@media screen and (min-width: 1279px) {
  .split-view {
    display: flex;
    margin: 32pt calc(-1 * var(--gutter));
    align-items: center;
  }

    .split-view__container {
      flex: 1 1 0;
      margin: 0 var(--gutter);
    }

    .split-view__container--last {
      order: 2;
    }

    .split-view__title {
      text-align: center;
      margin: 0 0 32pt;
    }

    .split-view__code pre {
      margin: 0;
    }
}
</style>

# 🍿 Transitions and Animations

Cssta provides convenience features around React’s Animated API. The syntax is identical to CSS (where supported).

Because of the declarative nature of CSS, only components that use these features will run code for the features. What’s more, if _no_ components use these features, the code isn’t even shipped in your production bundle!

Because we use the CSS spec, you can find a tonne of stuff on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation). Check our tables below to see what we support.

<div class="split-view">
<div class="split-view__container" markdown="block">

## Transitions

{:.split-view\_\_title}

| ✅ | transition <span class="note">_</span> |
| ✅ | transition-delay |
| ✅ | transition-duration |
| ✅ | transition-property <span class="note">_</span> |
| ✅ | transition-timing-function |
{:.feature-table}

</div>
<div class="split-view__container" markdown="block">

```jsx
const ButtonWithTransition = cssta(Animated.View)`
  background-color: blue;
  color: white;

  transition:
    background-color 0.5s ease-in,
    color 0.7s ease-in

  &[@disabled] {
    background-color: gray;
    color: light-gray;
  }
`
```

{:.split-view\_\_code}

</div>
</div>

<div class="split-view">
<div class="split-view__container split-view__container--last" markdown="block">

## Animations

{:.split-view\_\_title}

| ✅ | animation |
| ✅ | animation-delay |
| ❌ | animation-direction |
| ✅ | animation-duration |
| ❌ | animation-fill-mode <span class="note">**</span> |
| ✅ | animation-iteration-count <span class="note">\***</span> |
| ❌ | animation-play-state |
| ✅ | animation-name <span class="note">\*\*\*\*</span> |
| ✅ | animation-timing-function |
| ✅ | @keyframes |
{:.feature-table}

</div>
<div class="split-view__container" markdown="block">

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

{:.split-view\_\_code}

</div>
</div>

### Notes

You can animate multiple transforms, but the nodes of the transform must not change. I.e, you can animate `transform: scaleX(1) rotateX(0deg)` to `transform: scaleX(5) rotateX(30deg)`, but you cannot then transform to `transform: scaleY(5) skew(30deg)`.

<span class="note">\*</span> Transition properties cannot currently be shorthands, including things like `border-width`, but you can write `transition-property: border-top-width, border-right-width …`. You also cannot use custom properties to define them.

<span class="note">\*\*</span> Currently uses value of `fill-forwards`

<span class="note">\*\*\*</span> Must be a whole number or `infinite`

<span class="note">\*\*\*\*</span> Animations currently only support up to one animation

## 🎥 Custom Animations via `Animated.Value`

For more complicated animations, you’ll want to define a base component that has all your non-changing styles. You’ll then want a second component that has control over some `Animated.Value`s.

In your second component’s render function, return the base component along with your animated values passed in the `style` prop.

```jsx
const BaseStyles = cssta(View)`
  height: 100px;
  width: 100px;
  background-color: red;
`

const AnimateOpacity = () => {
  const [opacity] = React.useState(() => new Animated.Value(0))

  React.useLayoutEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1000
    }).start()
  }, [])

  return <BaseStyles style={% raw %}{{ opacity }}{% endraw %} />
}
```
