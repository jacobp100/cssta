# cssta-demo

Uses [create-react-app](https://github.com/facebookincubator/create-react-app) with cssta. Also uses [react-app-rewired](https://github.com/timarney/react-app-rewired) to override config.

Set up by first,

```bash
npm install --save-dev react-app-rewired
```

Then adding the following `<project-root>/config-overrides.js`:

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

Then change your `build` script in `package.json` to use `react-app-rewired`. Leave the `start` script as-is.

```json
{
  "scripts": {
    ...
    "build": "react-app-rewired build",
    ...
  }
}
```

Then add the following to `index.html`:

```html
<link rel="stylesheet" href="%PUBLIC_URL%/styles.css">
```

You should probably link up a minifier afterwards. See `package.json` for an example.
