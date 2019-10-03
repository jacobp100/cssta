---
title: Mixins
layout: page
permalink: /mixins/
---

# 🍪 Mixins

**Mixins are currently work in progress**. More features will come.

You can define a mixin as follows,

```jsx
const useMixinStyles = styled.mixin`
  width: 200px;

  @media (min-width: 768px) {
    width: 300px;
  }
`;
```

This returns a hook that returns styles. You can use it in a component like follows,

```jsx
const ComponentThatUsesMixins = ({ children }) => {
  const mixinStyles = useMixinStyles();

  return (
    <ScrollView contentContainerStyle={mixinStyles}>{children}</ScrollView>
  );
};
```

Note that because this is a hook, you _always_ need to call it.

There is not yet a way to reference a mixin from within a Cssta component.

## ✅ Feature Support

Below is a table of what you can and cannot do with mixins.

| Feature                                          | Supported |
| :----------------------------------------------- | :-------- |
| `[@prop]` selectors                              | ❌        |
| `@media` queries                                 | ✅        |
| Reference CSS custom properties (`var(--color)`) | ✅        |
| Defining CSS custom properties (`--color: red`)  | ❌        |
| Viewport units (`vw`, `vh` etc.)                 | ✅        |
| Transitions                                      | ❌        |
| Animations                                       | ❌        |
