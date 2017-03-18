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

export type BaseVariableArgs = {
  transitionedProperties: string[],
  importedVariables: string[],
  keyframesStyleTuples: { [key:string]: VariableKeyframeTuple[] },
}

export type RawVariableArgs = BaseVariableArgs & {
  ruleTuples: RawVariableRuleTuple[]
}

export type VariableArgs = BaseVariableArgs & {
  ruleTuples: VariableRuleTuple[]
}

export type BaseVariableRuleTuple = {
  exportedVariables: VariablesStore,
  transitionParts: ?{ [key:string]: string[] },
  animationParts: ?string[],
  styleTuples: StyleTuple[],
}

export type RawVariableRuleTuple = BaseVariableRuleTuple & {
  selector: string,
}

export type VariableWithValidator = {
  validate?: (props: Object) => boolean,
}

export type VariableRuleTuple = BaseVariableRuleTuple & VariableWithValidator

export type VariableKeyframeTuple = {
  time: number,
  styleTuples: StyleTuple[],
}

export type Args = {
  transitionedProperties: string[],
  keyframes: { [key:string]: Keyframe[] },
  rules: Rule[]
}

export type Rule = VariableWithValidator & {
  style: any,
  transitions?: ?{ [key:string]: string[] },
  animation?: ?string[],
}

export type Keyframe = {
  time: number,
  styles: any,
}
*/
