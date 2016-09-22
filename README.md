# CSSTA

Experimental project. Basically CSS Modules, but puts the CSS in the files, because that might be useful for some projects. Can generate real CSS files for production (with really tiny class names).

Not released on NPM yet.

Like CSS Modules, it

* Scopes class names
* Scopes animation names

Unline CSS Modules, it

* Does not allow variables (except for CSS `var(--name)`)
* Does not include `:global` and `:local`

Usage,

```js
const styles = cssta(`
  .button {
    color: black;
  }

  .button:hover {
    color: red;
  }

  .button-large {
    font-size: 2em;
  }

  .fade {
    animation: 1s scoped-animation;
  }

  @keyframes scoped-animation {
    0% { opacity: 0 }
  }
`);

export default () => (
  <button className={`${styles.button} ${styles['button-large']}`}>Test</button>
);
```

In dev, this will scope all class names and insert them into style elements. The `cssta(...)` call will return a mapping of name to a mangled non-conflict name.

In production, we'll use a babel plugin that will scope all class names, generate a **real CSS file**, and replace the `cssta(...)` call with an object of the mapping.

## Composition

If you're going to use babel to generate real CSS files, we can't interpolate strings. I.e.

```js
// THIS WILL NOT WORK
cssta(`
  .button {
    color: ${color};
  }
`);
```

You should use CSS variables to achieve this. Sidenote: interpolation only allows scoped variables, but in design, consistency is global property. It only makes sense that your globals follow that.

Calls to `cssta` return objects. This means your styles do not have to be in the same file as your components. It's perfectly fine to have a util file,

```js
// util.js
export default cssta(`
  .text-center {
    text-align: center !important;
  }
`);

// button.js
import utilStyles from './util.js'

const styles = cssta(...);

export default () => (
  <button className={`${styles.button} ${utilStyles['text-center']}`}>Test</button>
);
```

# Babel Plugin

The cssta module was designed to work in a development environment, so you don't want to use it in production. You can use `babel-plugin-cssta` to transform the cssta call into an object mapping and extract the CSS.

```js
{
  "plugins" [
    ["babel-plugin-cssta", {
      "output": "dist/css"
    }]
  ]
}
```

The output is relative to your current working directory.

**Before running babel, you must delete the existing CSS file**

# Demo and Building

**It's not on npm, so you'll have to link some stuff up first**

In this order,

1. In `babel-plugin-cssta`, run `npm install ../cssta`
2. In `cssta-demo`, run `npm install ../babel-plugin-cssta`

In `cssta-demo` you can,

* Run `npm start` for dev mode.
* Run `npm run build-cssta` for prod build, and see output JS and CSS files in `./dist`.

# TODO

* Can we do better than forcing the user to delete the CSS file before every run?
* Tests
