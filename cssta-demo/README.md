# cssta-demo

Uses [create-react-app](https://github.com/facebookincubator/create-react-app) with cssta. We have to force it to use our own babel. This is an awful hack, but an intermediate workaround until Facebook hopefully lets you use your own babel plugins. You can also eject your app, or use a different setup entirely.

Set up by adding the following `.babelrc`:

```json
{
  "plugins": [
    "syntax-jsx",
    ["babel-plugin-cssta", {
      "output": "public/styles.css"
    }]
  ]
}
```

Then adding the following to `scripts` in `package.json`:

```json
{
  "scripts": {
    ...
    "build": "npm run branch-src; npm run build-cssta || :; react-scripts build || :; npm run restore-src",
    "branch-src": "cp -r src src-original",
    "restore-src": "rm -rf src; mv src-original src",
    "build-cssta": "rm public/styles.css || :; babel src --out-dir src"
  }
}
```

Then the following in `index.html`:

```html
<link rel="stylesheet" href="%PUBLIC_URL%/styles.css">
```

This puts the CSS file in the `public` directory, which will then be built with create-react-app.

You should probably link up a minifier afterwards. See `package.json` for an example.
