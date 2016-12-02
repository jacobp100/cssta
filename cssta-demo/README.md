# cssta-demo

Uses [create-react-app](https://github.com/facebookincubator/create-react-app) with cssta. Also uses [react-app-rewired](https://github.com/timarney/react-app-rewired) to override config.

Set up by adding the following `config-overrides.js`:

```js
module.exports = (config) => {
  const babelLoader = config.module.loaders.find(loader => loader.loader === 'babel');
  babelLoader.query.plugins = [
    ...(babelLoader.query.plugins || []),
    ['babel-plugin-cssta', {
      output: 'build/styles.css',
    }],
  ];
  return config;
};
```

Then adding the following to `scripts` in `package.json`:

```json
{
  "scripts": {
    ...
    "build": "rm public/styles.css || :; react-scripts build"
    ...
  }
}
```

Then the following in `index.html`:

```html
<link rel="stylesheet" href="%PUBLIC_URL%/styles.css">
```

This puts the CSS file in the `public` directory, which will then be built with create-react-app.

You should probably link up a minifier afterwards. See `package.json` for an example.
