import { TransitionPart, AnimationPart } from "../../runtime/animationTypes";
import { StyleTuple } from "../../runtime/cssUtil";

export type PropType = { type: "bool" } | { type: "oneOf"; values: string[] };

export type PropTypes = { [key: string]: PropType };

export type Condition = { selector: string; mediaQuery: string };

export type KeyframeOfStyleTuples = {
  time: number;
  styleTuples: StyleTuple[];
};

export type KeyframesDeclaration = {
  name: string;
  sequence: KeyframeOfStyleTuples[];
  importedVariables: string[];
};

export type TransitionDeclaration = {
  condition: Condition | null;
  part: TransitionPart;
  importedVariables: string[];
};

export type AnimationDeclaration = {
  condition: Condition | null;
  part: AnimationPart;
  importedVariables: string[];
};

export type VariableExportDeclaration = {
  condition: Condition | null;
  name: string;
  value: string;
  importedVariables: string[];
};

export type StyleDeclaration = {
  condition: Condition | null;
  styleTuples: StyleTuple[];
  importedVariables: string[];
};

export type StyleMixinDeclaration = {
  condition: Condition | null;
  substitution: string;
};

export type ComponentDefinition = {
  propTypes: PropTypes;
  styles: StyleDeclaration[];
  transitions: TransitionDeclaration[];
  animations: AnimationDeclaration[];
  keyframes: KeyframesDeclaration[];
  exportedVariables: VariableExportDeclaration[];
};
