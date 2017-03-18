---
layout: page
title: Web
permalink: /web
---

# 🌍 Web

Except for the limitations of selectors, CSS otherwise works as normal. This  includes all `@-rules`.

```jsx
const Button = cssta.button`
  font-size: 12pt;

  :hover {
    font-weight: bold;
  }

  @media (max-width: 768px) {
    font-size: 12pt;
  }

  @supports (background: linear-gradient(to bottom, red, green)) {
    [*christmas] {
      background: linear-gradient(to bottom, red, green);
    }
  }
`
```

Animations work too, and CSSTA will scope the keyframe names to avoid conflicts.

```jsx
const Button = cssta.button`
  animation: 1s scoped-animation;

  @keyframes scoped-animation {
    0% { opacity: 0; }
  }
`
```

## 🌐 Globals

It is common to define some base styles to tag names, such as `h1`s and `p`s. This can be done with `injectGlobal`, and supports all CSS.

```jsx
cssta.injectGlobal`
  :root {
    --margin: 25pt;
  }

  body {
    margin: var(--margin);
  }
`
```

This can also create global animations.

```jsx
cssta.injectGlobal`
  @keyframes fade-in {
    0% { opacity: 0; }
  }
`

const Button = cssta.button`
  animation: 1s fade-in;
`
```

## 🎚 Polyfills

We don’t auto-prefix your CSS, so you’ll likely want to use [autoprefixer](https://github.com/postcss/autoprefixer). If you’re using CSS custom properties, you’ll also want to use [postcss-css-variables](https://github.com/MadLittleMods/postcss-css-variables)
