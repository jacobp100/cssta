// @flow

/*::
export type VariablesStore = { [key:string]: string }
export type StyleTuple = [string, string]
export type Style = { [key:string]: any } | string

// Arrays of each word in value
// i.e. `transition: color 1s linear` => ['color', '1s', 'linear']
// transitionParts keyed by property name
// These might have variables
export type TransitionParts = {
  _?: string,
  delay?: string,
  duration?: string,
  property?: string[], // Pre-processed
  timingFunction?: string,
}

export type AnimationParts = {
  _?: string,
  delay?: string,
  duration?: string,
  name?: string,
  timingFunction?: string,
  iterations?: string,
}

export type VariableWithValidator = {
  validate?: (props: Object) => boolean,
}

export type BaseVariableArgs = {|
  styleSheetCache: { [key:string]: any },
  transitionedProperties: string[],
  importedVariables: string[],
  keyframesStyleTuples: { [key:string]: (VariableKeyframeTuple | Keyframe)[] },
|}

export type RawVariableArgs = {|
  ...BaseVariableArgs,
  ruleTuples: RawVariableRuleTuple[],
|}

export type VariableArgs = {|
  ...BaseVariableArgs,
  ruleTuples: (VariableRuleTuple | Rule)[],
|}

export type BaseVariableRuleTuple = {|
  exportedVariables: VariablesStore,
  transitionParts: ?TransitionParts,
  animationParts: ?AnimationParts,
  styleTuples: StyleTuple[],
|}

export type RawVariableRuleTuple = {|
  ...BaseVariableRuleTuple,
  selector: string,
  mediaQuery: ?string,
|}

export type VariableRuleTuple = {|
  ...BaseVariableRuleTuple,
  ...$Exact<VariableWithValidator>,
|}

export type VariableKeyframeTuple = {|
  time: number,
  styleTuples: StyleTuple[],
|}

export type Args = {|
  transitionedProperties: string[],
  keyframes: { [key:string]: Keyframe[] },
  rules: Rule[],
|}

export type Rule = {|
  ...$Exact<VariableWithValidator>,
  transitions?: ?TransitionParts,
  animations?: ?AnimationParts,
  style: Style,
|}

export type Keyframe = {|
  time: number,
  style: any,
|}
*/
