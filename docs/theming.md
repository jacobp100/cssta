---
layout: page
title: Theming
permalink: /theming/
---

# 🏳️‍🌈 Theming

As said in the introduction, theming sholud be done by CSS custom properties. Cssta for React Native has custom property polyfills built in. On the web, you can either rely on native browser support or [a postCSS plugin](https://github.com/MadLittleMods/postcss-css-variables#differences-from-postcss-custom-properties).

To define CSS variables, you just define a property starting with a double dash (`--`). On the web, you can use `injectGlobal` for global variables, but in Native, you’ll need a wrapper view.

```jsx
// Web
cssta.injectGlobal`
  :root {
    --primary: red;
  }
`;

// Native
const Root = cssta(View)`
  --primary: red;
`;
```

You can then use the variables using the `var` function. Note that the variable can be combined with other values, including more variables.

```jsx
const Button = cssta.button`
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.5rem 1rem;
`;
```

You can redefine variables in any component, and their descendants will use the updated values.

```jsx
const LightBox = cssta.div`
  background-color: black;
  --primary: white;
`;

const Example = (
  <LightBox>
    <Button>I am white on black!</Button>
  </LightBox>
);
```

You can also dynamically change the values of the variables through prop selectors.

```jsx
const LightBox = cssta.div`
  background-color: black;
  --primary: white;

  &[@inverted] {
    background-color: white;
    --primary: black;
  }
`;

const Example = (
  <LightBox inverted>
    <Button>I am black on white!</Button>
  </LightBox>
);
```

## 💉 Using JavaScript Variables

You can pass variables from JavaScript to CSS. For the web, just use the `style` prop (although this requires native browser support).

```jsx
const Example = (
  <div style={% raw %}{{ "--primary": mainColor }}{% endraw %}>
    <Button>I have the color "mainColor"</Button>
  </div>
)
```

For React Native, there’s a `VariablesProvider` component. Just pass in an object of your variables omitting the double dash. You can see more information over in the [native docs]({{ site.baseurl }}/native#custom-properties).

```jsx
import { VariablesProvider } from "cssta/native"

<VariablesProvider exportedVariables={% raw %}{{ primary: "red" }}{% endraw %}>
  <Button />
</Variables>
```
