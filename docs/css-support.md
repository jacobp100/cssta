---
title: CSS Support
layout: page
permalink: /css-support/
---

# ✅ CSS Support

We support all the styling configuration React Native does. We can also polyfill some features where React Native doesn’t have a straightforward implementation.

Below is a list of everything we currently support,

**Shorthands** multi-value definitions for things like margin etc.

**Media queries** min and max width and height, orientation, prefers-color-scheme

**CSS custom properties** with inheritance and fallback values

**Viewport units** vw, vh, vmin, vmax

**Transitions** transition everything except shorthand values and custom properties

**Animations** for keyframes defined within the component, missing a few animation properties

## ⚡️ Non-Standard

**Prop selectors** use `[@prop]` or `[@prop="stringValue"]` selectors to query props

**Media query** platform (ios or android)
