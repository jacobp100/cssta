The dynamic component is sort of like middlewares in Redux: each enhances the behaviour of the final component. Each element in the enhancer chain takes props and a child, and clones the child with transforms props. The final node returns a styled component, defined in staticComponentTransform.js.

We have StyleSheetManagers, which are required, and must be the first enhancer. These take rules style tuples and return rules with style objects. There are only two style sheet managers: a static one, that does exactly as above; and one that applies CSS custom properties to the returned style objects. This is because custom properties essentially rewrite the stylesheet. Hopefully CSS custom properties are the only feature that have such an exception.

The other enhancers are mostly adding extra rules. One example is the TransitionTransform, which adds `Animated.Values` to get CSS animations to work. While not done yet, I believe `@keyframes` should also work via this mechanism, and maybe even `@media`.

It's worth noting that StyleSheetManagers also cache rules using `StyleSheet.create()`.
