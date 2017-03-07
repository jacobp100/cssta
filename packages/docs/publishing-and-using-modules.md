# Ⓜ️ Publishing and Using External Modules

As a user of external Cssta modules, all you have to do is ensure these modules are run through babel using `babel-plugin-cssta`. On the web, this will add the module’s CSS in the outputted CSS file, and on native, this will mostly perform optimizations.

All Cssta modules have to use the ES `import ... from 'cssta';` syntax for the babel plugin to work. For users, this means ensuring your build process can handle this. For publishers, just make sure your users get this syntax!

## Webpack 

To get Cssta modules working, you have to make sure that you are running all files in `node_modules` through babel. Most guides recommend you exclude `node_modules`, so make sure you haven’t copied this over.

```js
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

## ✅ Publisher Recommendations

### 🏳️‍🌈 Theming

For theming, try to stick to using user-definable, namespaced variables to override defaults.

```js
export const Button = cssta.div`
  color: var(--example-module-primary, red);
`;
```

For native, you can abstract out your defaults into variables.

```js
const defaultPrimary = 'red';

export const Button = cssta(View)`
  color: var(--example-module-primary, ${defaultPrimary});
`;
```

For web, you could consider having the user copy and paste a snippet of all variables if it is not practical to manually write each default.

You may also wish to allow specific overrides if appropriate.

```jsx
const Button = cssta.div`
  color: var(--example-module-primary, red);
`;

export default ({ color, ...props }) => (
  <Button {...props} style={{ color }} />
);
```

### ⛸ Optimizations

For native, work out what [optimizations](./production_builds.md) could be applied. For example, if you only do simple interpolations, you could use `interpolateValuesOnly`. If you only use CSS variables, but do not define them, you could use `singleSourceOfVariables`. Give this information to your users!
