# CSSTA

Experimental project. Basically CSS Modules, but puts the CSS in the files, because that might be useful for some projects. Can generate real CSS files for production.

Not released on NPM yet.

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

You should use CSS variables. Also, interpolation only allows scoped variables. But really, scoped variables make little sense in CSS anyway: if you have a value that you want shared, you want it shared in as many places as possible to add consistency to your design. Globals really do make sense here. */side-note*

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

# Demo

See the demo in `cssta-demo`.

Use `npm start` for dev mode.

Use `npm run babel-cssta` for prod build, and see output in `styles.css` and `./cssta-dist`.

# TODO

* Scope animation names
* Custom CSS output directory
* Can we do better than forcing the user to delete the CSS file before every run?
* Throw errors on interpolation
* Tests
