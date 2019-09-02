---
title: Interpolation
layout: page
permalink: /interpolation/
---

# ✂️ Interpolation

Interpolation in Cssta is really a work in progress. It will never support interpolating functions. It will eventually support mixins and handling keyframes like styled-components. However, for now, you can only interpolate single values.

##### Valid

```jsx
const Component = cssta(View)`
  border-bottom: ${StyleSheet.hairlineWidth}px solid grey;
`;
```

##### Invalid

```jsx
const Component = cssta(View)`
  ${rules};

  border: ${props => props.color};
`;
```
