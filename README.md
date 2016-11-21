# CSSTA

## [Docs](https://jacobp100.gitbooks.io/cssta/content/)

```
npm install --save cssta
npm install --save-dev babel-plugin-cssta
```

CSSTA is a way to co-locate your CSS with your React components, and allows you to define components in terms of units of style.

It is available both for [React for web 🌍](./web.md) and [React Native 📱](./native.md). It generates **real CSS files** for web.

It is almost identical in concept to [styled-components](https://github.com/styled-components/styled-components), but makes different trade-offs.

```js
const Button = cssta.button`
  padding: 0.5em 1em;

  [large] {
    font-size: 2em;
  }

  :not([noOutline]) {
    border: 1px solid currentColor;
  }

  [priority="critical"] {
    color: red;
  }
  [priority="important"] {
    color: orange;
  }
`;

<Button large>Large Button with an Outline</Button>,
<Button noOutline>Button with no Outline</Button>,
<Button priority="critical">Red Button with an Outline</Button>,
<Button priority="important">Orange Button with an Outline</Button>,

<Button large noOutline priority="critical">
  Large, Red Button with no Outline
</Button>
```
