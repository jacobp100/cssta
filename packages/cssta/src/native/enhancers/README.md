Enhancers are similar to the enhancers in Redux middlewares: each enhances the behaviour of the final component. Each element in the enhancer chain takes props and a child, transforms the props, and clones the child using the transformed props. The final node returns a styled component, defined in createComponent.js.

Most enhancers just add extra rules. For example, `Transition` and `Animation` add rules with `Animated.Values` to get CSS animations to work.

We also have `VariablesStyleSheetManager`. In development, this is required, as it transforms the output of `extractRules` into something the other enhancers and `createComponent` can handle. Mainly, it takes style tuples and converts them into style objects (and then puts those through `StyleSheet.create()`). It will also transform keyframes in this manner. It's worth noting that it also handles the `color` function polyfill.

On production, if variables aren't used, we can actually perform all the actions `VariablesStyleSheetManager` does in the precompilation, and then skip this enhancer on the client. The precompilation step will create a stylesheet using `StyleSheet.create()`
