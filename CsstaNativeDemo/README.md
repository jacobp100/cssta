# CsstaNativeDemo

Simple React-Native project using cssta. Setup:

```bash
npm install --save cssta
npm install --save-dev babel-plugin-cssta
```

Add following to `.babelrc`:

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

That's all! You probably want to enable some [optimisations](https://jacobp100.gitbooks.io/cssta/content/production_builds.html) if you use template interpolation.
