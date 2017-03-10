---
layout: page
title: Production Builds
permalink: /production-builds
---

# ⛵️ Production Builds

A Babel plugin exists for both web and React Native. For web, it will generate a real CSS file. For React Native, it will perform a lot of pre-parsing and reduce the amount of dependencies. Both platforms are handled by the same plugin:

```bash
npm install --save-dev babel-plugin-cssta
```

And in your `.babelrc`.

```json
{
  "plugins": ["babel-plugin-cssta"]
}
```

## 🌍 Web

If you are building for the web, you need to specify a CSS file to write out to with the `output` option. This is relative to your current working directory.

```json
{
  "plugins": [
    ["babel-plugin-cssta", {
      "output": "dist/styles.css"
    }]
  ]
}
```

You can transform multiple JS files, and the CSS will be concatenated to. However, **before you run babel, you must delete the existing CSS file** so you don’t end up with duplicate CSS.

## ⛸ Optimizations

You can enable certain build optimizations in the `optimizations` parameter in the options.

```json
{
  "plugins": [
    ["babel-plugin-cssta", {
      "optimizations": [
        "name1",
        "name2",
        ["name3", {
          "optimizationConfigName": "optimizationConfigValue"
        }],
      ]
    }]
  ]
}
```

### `interpolateValuesOnly` (Recommended)

Template interpolation (`${value}`) in React Native is permitted anywhere. However, this makes it impossible to pre-parse, since you could be interpolating entire rules. As a result, when you interpolate values, we have to bundle postCSS, and perform parsing at run-time.

The most common use-case for interpolation is interpolating values. If you limit interpolation to only values this, we can pre-parse your CSS at build-time, and won’t bundle postCSS. CSS short-hands are still supported using this optimization.

You cannot interpolate property names or entire declarations.

###### Examples

```jsx
// ✅
const color = 'red'
const small = 5
const large = 10

const RedView = cssta(View)`
  color: ${color};
  margin: ${small} ${large};
  border: ${1 / PixelRatio.get()} solid red;
`
```

```jsx
// ❌ Not interpolating a value
const prop = 'font'

const invalid = cssta(Text)`
  ${prop}: 12 "Helvetica";
`
```

```jsx
// ❌ Not interpolating a value
const mixin = `
  color: blue;
`

const invalid = cssta(Text)`
  ${mixin}
`
```

### `singleSourceOfVariables`

This is for you define all CSS custom properties in a single component, and do not define properties elsewhere. We can substitute the values in and perform more pre-compilation. You cannot use template interpolation in the component that defines variables.

###### Options

* `sourceFilename` (required): A file containing the component that defines all variables

###### Examples

```jsx
// ✅
const Component = cssta(View)`
  --primary: red;
`

const OtherComponent = cssta(View)`
  backgroundColor: var(--primary);
`
```

```jsx
// ✅ You can still reference your own variables
const Component = cssta(View)`
  --red: red;
  --primary: var(--red);
`
```

```jsx
// ❌ Interpolating values
const red = 'red';

const Component = cssta(View)`
  --primary: ${red};
`
```

```jsx
// ❌ Two components define properties
const Component1 = cssta(View)`
  --primary: red;
`

const Component2 = cssta(View)`
  --secondary: blue;
`
```
