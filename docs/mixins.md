---
title: Mixins
layout: page
permalink: /mixins/
---

# 🍪 Mixins

You can define a mixin as follows,

```jsx
const useMixinStyles = cssta.mixin`
  width: 200px;

  @media (min-width: 768px) {
    width: 300px;
  }
`;
```

You can use it in other components using `@include` and then wrapping your mixin name in `${` and `}`.

```jsx
const OtherComponent = cssta(View)`
  @include ${useMixinStyles};
`;
```

## 💗 Use in Other Components

We called the variable above `useMixinStyles` because `cssta.mixin` returns a hook.

You can call the hook in your own components too, and when you do, it will return styles that you can then pass to other components.

```jsx
const ComponentThatUsesMixins = ({ children }) => {
  const mixinStyles = useMixinStyles();

  return (
    <ScrollView contentContainerStyle={mixinStyles}>{children}</ScrollView>
  );
};
```

Note that because this is a hook, you _always_ need to call it.

## ✅ Feature Support

Below is a table of what you can and cannot do with mixins.

| Feature                                          | Supported |
| :----------------------------------------------- | :-------- |
| `[@prop]` selectors                              | ❌        |
| `@media` queries                                 | ✅        |
| `@include` mixins                                | ✅        |
| Reference CSS custom properties (`var(--color)`) | ✅        |
| Defining CSS custom properties (`--color: red`)  | ❌        |
| Viewport units (`vw`, `vh` etc.)                 | ✅        |
| Transitions                                      | ❌        |
| Animations                                       | ❌        |
