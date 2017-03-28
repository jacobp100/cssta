// @flow
/*
Arrays of each word in value
i.e. `transition: color 1s linear` => ['color', '1s', 'linear']
transitionParts keyed by property name
These might have variables
*/

/*::
export type VariablesStore = { [key:string]: string }
export type StyleTuple = [string, string]
export type Style = { [key:string]: any } | string

export type VariableWithValidator = {
  validate?: (props: Object) => boolean,
}

export type BaseVariableArgs = {|
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
  transitionParts: ?{ [key:string]: string[] },
  animationParts: ?string[],
  styleTuples: StyleTuple[],
|}

export type RawVariableRuleTuple = {|
  ...BaseVariableRuleTuple ,
  selector: string,
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
  style: Style,
  transitions?: ?{ [key:string]: string[] },
  animation?: ?string[],
|}

export type Keyframe = {|
  time: number,
  styles: any,
|}
*/
