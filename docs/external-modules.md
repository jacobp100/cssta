---
layout: page
title: External Modules
permalink: /external-modules
---

# Ⓜ️ External Modules

As a user of external Cssta modules, all you have to do is ensure these modules are run through babel using `babel-plugin-cssta`. On the web, this will add the module’s CSS in the outputted CSS file, and on native, this will mostly perform optimizations.

## Webpack

To get Cssta modules working, you have to make sure that you are running all files in `node_modules` through babel. Most guides recommend you exclude `node_modules`, so make sure you haven’t copied this over.

```jsx
{
  module: {
    loaders: [{
      test: /\.jsx?$/,
      loader: 'babel-loader',
      options: {
        // Your normal config, just make sure you include babel-plugin-cssta
        presets: ['env'],
        plugins: [
          ['babel-plugin-cssta', { output: 'dist/styles.css' }],
        ],
      },
    }],
  },
}
```

However, if this is causing serious performance issues, you can do two runs through babel ([example](https://gist.github.com/jacobp100/4f0b08bf485bfcdcb17741cbabf85c75)).

## 🅿️ Publishers

All Cssta modules have to use the ES `import … from 'cssta'` syntax for the babel plugin to work. For users, this means ensuring your build process can handle this. For publishers, just make sure your users get this syntax!
