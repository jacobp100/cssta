---
title: Technical Details
layout: page
permalink: /technical-details/
---

<style>
@media screen and (min-width: 1024px) {
  .code-transform {
    display: grid;
    grid-template-columns: 120px auto;
  }
}
</style>

# 🛠 Technical Details

Cssta takes a lot of inspiration from macros in Rust and ppx transforms in OCaml/ReasonML. Your component definition is converted into an actual component by Cssta’s transform. For example,

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  color: green;
`;
```

##### OUTPUT

```jsx
import React from "react";

const styles = {
  0: {
    color: "green"
  }
};

const Example = React.forwardRef((props, ref) => {
  const style = props.style != null ? [styles[0], props.style] : styles[0];
  return <View {...props} ref={ref} style={style} />;
});
```

</div>

All the examples in this guide are taken directly from test cases you’ll be able to find in `compiler/__tests__/build.js`.

If you add _prop selectors_, these become conditionally applied styles. Also note that the properties in these selectors are removed from the passed in `props` object.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  color: green;

  &[@test] {
    color: blue;
  }
`;
```

##### OUTPUT

```jsx
import React from "react";

const styles = {
  0: {
    color: "green"
  },
  1: {
    color: "blue"
  }
};

const Example = React.forwardRef(({ test, ...props }, ref) => {
  const style = [styles[0], test === true ? styles[1] : null, props.style];
  return <Element {...props} ref={ref} style={style} />;
});
```

</div>

At this point, there is no Cssta runtime. Everything we import is from React itself.

## 🖥 Media Queries

These work mostly the same as conditional styles, but the conditions here are come from a `useMediaQuery` hook from Cssta.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  color: green;

  @media (min-width: 500px) {
    color: red;
  }
`;
```

##### OUTPUT

```jsx
import React from "react";
import useMediaQuery from "cssta/runtime/useMediaQuery";
const styles = {
  0: {
    color: "green"
  },
  1: {
    color: "red"
  }
};
const Example = React.forwardRef((props, ref) => {
  const { width: screenWidth, height: screenHeight } = useMediaQuery();
  const style = [styles[0], screenWidth >= 500 ? styles[1] : null, props.style];
  return <Element {...props} ref={ref} style={style} />;
});
```

</div>

## ✏️ Custom Properties

Custom properties are supported by a `useCustomProperties` hook. In addition, everything that needs custom properties has an additional hook. Styles have `useCustomPropertyStyleSheet`, and animations and transitions have `useCustomPropertyShorthandParts` (more on that later).

The stylesheet also gets reformatted from an object of styles to an array of style tuples. That’s because after interpolating the custom property values, it gets run through [css-to-react-native](https://github.com/styled-components/css-to-react-native), which expects style tuples.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  color: var(--width);
`;
```

##### OUTPUT

```jsx
import React from "react";
import useCustomProperties from "cssta/runtime/useCustomProperties";
import useCustomPropertyStyleSheet from "cssta/runtime/useCustomPropertyStyleSheet";

const unresolvedStyleTuples = [[["width", "var(--width)"]]];

const Example = React.forwardRef((props, ref) => {
  const customProperties = useCustomProperties(null);
  const styles = useCustomPropertyStyleSheet(
    unresolvedStyleTuples,
    customProperties
  );
  const style = props.style != null ? [styles[0], props.style] : styles[0];
  return <Element {...props} ref={ref} style={style} />;
});
```

</div>

The `null` in `useCustomProperties(null)` is because here, we don’t export any variables. To export them, we just pass them in as an object, and the `useCustomProperties` hook will resolve all the dependencies.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  --width: 100px;
`;
```

##### OUTPUT

```jsx
import React from "react";
import useCustomProperties from "cssta/runtime/useCustomProperties";
import VariablesContext from "cssta/runtime/VariablesContext";

const exportedCustomProperties = {
  width: "100px"
};

const Example = React.forwardRef((props, ref) => {
  const customProperties = useCustomProperties(exportedCustomProperties);
  return (
    <VariablesContext.Provider value={customProperties}>
      <Element {...props} ref={ref} />
    </VariablesContext.Provider>
  );
});
```

</div>

# 🍿 Transitions and Animations

These also are just hooks. Both take the current style and information about the animation, and return a new style.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  color: red;
  transition: color 5s;

  &[@active] {
    color: green;
  }
`;
```

##### OUTPUT

```jsx
import React from "react";
import useTransition from "cssta/runtime/useTransition";
const styles = {
  0: {
    color: "red"
  },
  1: {
    color: "green"
  }
};
const transition = [
  {
    property: "color",
    timingFunction: "ease",
    delay: 0,
    duration: 5000
  }
];
const Example = React.forwardRef(({ active, ...props }, ref) => {
  let style = [styles[0], active === true ? styles[1] : null, props.style];
  style = useTransition(transition, style);
  return <Element {...props} ref={ref} style={style} />;
});
```

</div>

Most of the time, we’re able to statically determine what the transition or animation should be. But when custom properties get involved, we can’t do this. When we’re not able to statically determine this, we call into the runtime `flattenAnimation` or `flattenTransition` to determine this. These take properties extracted from the CSS, like `transition-name`, or a shorthand like `transition`, and merge them into something the hook understands.

Animations look mostly the same as above, but we also extract the styles from the keyframes.

<div class="code-transform" markdown="block">

##### INPUT

```jsx
const Example = cssta(View)`
  animation: fade-in 1s;

  @keyframes fade-in {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;
```

##### OUTPUT

```jsx
import React from "react";
import useAnimation from "cssta/runtime/useAnimation";

const keyframes = {
  "fade-in": [
    {
      time: 0,
      style: {
        opacity: 0
      }
    },
    {
      time: 1,
      style: {
        opacity: 1
      }
    }
  ]
};

const animation = {
  delay: 0,
  duration: 1000,
  iterations: 1,
  name: "fade-in",
  timingFunction: "ease"
};

const Example = React.forwardRef((props, ref) => {
  let style = props.style;
  style = useAnimation(keyframes, animation, style);
  return <Element {...props} ref={ref} style={style} />;
});
```

</div>
