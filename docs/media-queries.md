---
title: Media Queries
layout: page
permalink: /media-queries/
---

# 🖥 Media Queries

These work as they do in CSS. We support the following:

- `width`
- `min-width`
- `max-width`
- `height`
- `min-height`
- `max-height`
- `orientation`
- `prefers-color-scheme` (See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme), RN 0.60+)
- `platform`

The `platform` parameter queries whatever `Platform.OS` returns—in regular React Native, this’ll be `ios` or `android` (both lowercase).

```jsx
const Title = cssta(Text)`
  @media (platform: ios) {
    font-family: "San Francisco";
  }
};
```

Just like in CSS, rules can be nested in media queries.

```jsx
const Title = cssta(Text)`
  font-size: 12px;

  [@large] {
    font-size: 18px;
  }

  @media (min-width: 600px) {
    font-size: 24px;

    [@large] {
      font-size: 48px;
    }
  }
`;
```

You can also combine queries the same way as regular CSS.

```jsx
const Title = cssta(Text)`
  @media (platform: ios) and (min-width: 600px) {
    font-family: "San Francisco Display";
  }
};
```
