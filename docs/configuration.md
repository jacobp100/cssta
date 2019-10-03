---
title: Configuration
layout: page
permalink: /configuration/
---

# ⚙️ Configuration

Depending on your setup of Cssta, your configuration will either be in your `.babelrc` file, or via `.babel-plugin-macrosrc`.

For your `.babelrc`, you can add the options like so (note the extra array),

```diff
 {
-   "plugins": ["babel-plugin-cssta"]
+   "plugins": [["babel-plugin-cssta", { "your": "options" }]]
 }
```

For babel plugin macros, just add the `cssta` key under your config. There’s more information on how to do this in [their docs](https://github.com/kentcdodds/babel-plugin-macros/blob/master/other/docs/user.md#config-experimental).

## 🌍 Global Variables

If you’re only using CSS custom properties as global variables, you can specify all your variables under `globals`.

If you set this up, you don’t have to exclusively use globals—you can define new variables in the code as long as they don’t conflict with any of your globals.

And don’t add the `--` before each variable name!

```json
{
  "globals": {
    "primary": "red",
    "marginSm": "6px",
    "marginMd": "12px",
    "marginLg": "18px"
  }
}
```

If you don’t want to use any other variables outside your globals, you can also enable the `globalVarsOnly` option to protect yourself against typos.

```diff
 {
   "globals": {
     "primary": "red",
     "marginSm": "6px",
     "marginMd": "12px",
     "marginLg": "18px"
   },
+  "globalVarsOnly": true
 }
```
