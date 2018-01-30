---
layout: page
title: Custom Properties & Interpolation
permalink: /native/custom-properties-interpolation/
---

# ✏️ Custom Properties
{: #custom-properties-interpolation}

Cssta supports CSS custom properties almost exactly like in native CSS.

If you’ve not seen these before, you can define your own variables by defining a property starting with a double dash: e.g. `--property: 5`. You can then reference them using the `var` function.

Your custom properties are also inherited by children, so you can use them to create styling contexts.

We have some examples over on our [theming section]({{ site.baseurl }}/theming), and there’s also some examples on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

```jsx
const Component = cssta(View)`
  color: var(--color);
  --color: red;
`
```

The only difference from native CSS is that you cannot pass in custom properties through the `style` prop. We have a `<VariablesProvider>` component for that. Just pass in your custom properties (without the first double dash: `--`).

```jsx
import { VariablesProvider } from "cssta/native"

<VariablesProvider exportedVariables={% raw %}{{ color: "red" }}{% endraw %}>
  <ComponentsThatUseColorVariable />
</Variables>
```

You can also pass a function for `exportedVariables`, which is called with an object of the parent scope, and should return a new scope for its children.

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

## ✂️ Interpolation

In addition to CSS custom properties, you can use JavaScript’s `${value}` syntax to interpolate values. Note that you can only interpolate values or parts of values, and not entire rules or mixins. This is mostly useful for using platform constants.

```jsx
const Component = cssta(View)`
  border-bottom: ${StyleSheet.hairlineWidth}px solid grey;
`
```
