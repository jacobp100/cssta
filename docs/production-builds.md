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

## 📱 Native

For native, just create a `.babelrc` file with the following.

```json
{
  "presets": ["react-native"],
  "env": {
    "production": {
      "plugins": ["babel-plugin-cssta"]
    }
  }
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
