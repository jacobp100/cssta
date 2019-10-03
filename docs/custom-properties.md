---
layout: page
title: Custom Properties
permalink: /custom-properties/
---

# ✏️ Custom Properties

{: #custom-properties}

Cssta supports CSS custom properties almost exactly like in native CSS.

If you’ve not seen these before, you can define your own variables by defining a property starting with a double dash: e.g. `--property: 5`. You can then reference them using the `var` function.

Your custom properties are also inherited by children, so you can use them to create styling contexts.

We have some examples over on our [theming section]({{ site.baseurl }}/theming), and there’s also some examples on [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/--*).

```jsx
const Component = cssta(View)`
  color: var(--color);
  --color: red;
`;
```

The only difference from native CSS is that you cannot pass in custom properties through the `style` prop. We have a `<VariablesContext>` component for that. Just pass in your custom properties (without the first double dash: `--`).

```jsx
import VariablesContext from "cssta/runtime/VariablesContext";

<VariablesContext.Provider value={% raw %}{{ color: "red" }}{% endraw %}>
  <ComponentsThatUseColorVariable />
</VariablesContext.Provider>;
```

You can also use this as a hook,

```jsx
const MyComponent = () => {
  let variables = React.useContext(VariablesContext);
  variables = { ...variables, color: "red" };
  return (
    <VariablesContext.Provider value={variables}>
      <ComponentsThatUseColorVariable />
    </VariablesContext.Provider>
  );
};
```

## 🌍 Global Variables

If all your custom properties are global, you can configure them in the Cssta build configuration. There’s more information on this over in the [configuration]({{ site.baseurl }}/configuration) section.
