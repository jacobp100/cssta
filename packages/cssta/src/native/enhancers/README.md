Enhancers are similar to the enhancers in Redux middlewares: each enhances the behaviour of the final component. Each element in the enhancer chain takes props and a child, transforms the props, and clones the child using the transformed props. The final node returns a styled component, defined in createComponent.js.

Most enhancers just add extra rules. For example, `Transition` and `Animation` add rules with `Animated.Values` to get CSS animations to work.

We also have `VariablesStyleSheetManager`. In development, this is required, as it transforms the output of `extractRules` into something the other enhancers and `createComponent` can handle. Mainly, it takes style tuples and converts them into style objects (and then puts those through `StyleSheet.create()`). It will also transform keyframes in this manner. It's worth noting that it also handles the `color` function polyfill.

On production, if variables aren't used, we can actually perform all the actions `VariablesStyleSheetManager` does in the precompilation, and then skip this enhancer on the client. The precompilation step will create a stylesheet using `StyleSheet.create()`

Before VariablesProvider

```js
type ArgsBefore = {
  importedVariables: string[],
  transitionedProperties: string[],
  keyframesStyleTuples: { [key:string]: KeyframeTuple },
  ruleTuples: RuleTuple[]
}

type VariablesStore = { [key:string]: string }

type Styletuple = [string, string]

type RuleTuple = {
  validate: (props: Object) => boolean,
  styleTuples: Styletuple[],
  exportedVariables: { [key:string]: string },
  /*
  Arrays of each word in value
  i.e. `transition: color 1s linear` => ['color', '1s', 'linear']
  transitionParts keyed by property name
  These might have variables
  */
  transitionParts: { [key:string]: string[] },
  animationParts: string[],
}

type KeyframeTuple = {
  time: number,
  styleTuples: StyleTuple[],
}
```

After VariablesProvider (unchanged names means unchanged values)

```js
type ArgsAfter = {
  transitionedProperties: string[],
  keyframes: { [key:string]: Keyframe },
  ruleTuples: Rule[]
}

type Rule = {
  validate: (props: Object) => boolean,
  style: any,
  transitions: { [key:string]: string[] },
  animation: string[],
}

type KeyframeTuple = {
  time: number,
  style: any,
}
```
