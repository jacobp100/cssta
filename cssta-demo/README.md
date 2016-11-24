# cssta-demo

Uses [create-react-app](https://github.com/facebookincubator/create-react-app) with cssta.

This was set up by adding the following `.babelrc`:

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
    "build": "npm run build-cssta; react-scripts build",
    "build-cssta": "rm public/styles.css || :; babel src --out-dir $TMPDIR/cssta-demo"
  }
}
```

Then the following in `index.html`:

```html
<link rel="stylesheet" href="%PUBLIC_URL%/styles.css">
```

This puts the CSS file in the `public` directory, which will then be built with create-react-app. Because create-react-app does its own build, we're really only using babel to generate the CSS file: hence we disregard the JavaScript generated.

You should probably link up a minifier afterwards. See `package.json` for an example.

## Limitations with Create-React-App

The postCSS setup described [https://jacobp100.gitbooks.io/cssta/content/web.html](here) does not work too well. You can follow the instructions, and it will work. However, there is no way to ignore the bootstrap file, so you will end up including postCSS among other dependencies.

postCSS plugins that are for backwards compatability of features that work in your browser will work (autoprefixer, css-next etc.).
