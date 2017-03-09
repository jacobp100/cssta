---
layout: page
title: Theming
permalink: /theming
---

# 🏳️‍🌈 Theming

As said in the introduction, theming sholud be done by CSS custom properties. Cssta for React Native has custom property polyfills built in. On the web, you can either rely on native browser support or [a postCSS plugin](https://github.com/MadLittleMods/postcss-css-variables#differences-from-postcss-custom-properties).

To define global variables, you can do the following on the web.

```jsx
// Web
cssta.injectGlobal`
  :root {
    --primary: red;
  }
`
```

But in React Native, you'll have to create a wrapper View.

```jsx
// Native
const Root = cssta(View)`
  --primary: red;
`
```

You can then use the variables as normal.

```jsx
const Button = cssta.button`
  color: var(--primary);
  border: 1px solid var(--primary);
  padding: 0.5rem 1rem;
`
```

To add dynamic styling based upon context, just redefine variables.

```jsx
const LightBox = cssta.div`
  background-color: black;
  --primary: white;
`

const Example = (
  <LightBox>
    <Button>I am white on black!</Button>
  </LightBox>
)
```

And to make dynamic styling even more dynamic.

```jsx
const LightBox = cssta.div`
  background-color: black;
  --primary: white;

  [inverted] {
    background-color: white;
    --primary: black;
  }
`

const Example = (
  <LightBox inverted>
    <Button>I am black on white!</Button>
  </LightBox>
)
```
