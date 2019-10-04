import cssToReactNative, { transformRawValue } from "css-to-react-native";
import transformVariables from "./css-transforms/variables";
import transformColors from "./css-transforms/colors";
import { Variables } from "./VariablesContext";
// Viewport (hopefully) already transformed

export type StyleTuple = [string, string];
export type Style = Record<string, any>;

export { transformRawValue };

export const transformStyleTuples = (
  styleTuples: StyleTuple[],
  appliedVariables?: Variables
): Style => {
  const transformedStyleTuples = styleTuples.map(([property, value]) => {
    let transformedValue = value;
    if (appliedVariables != null) {
      transformedValue = transformVariables(transformedValue, appliedVariables);
    }
    transformedValue = transformColors(transformedValue);
    return [property, transformedValue];
  });
  return cssToReactNative(transformedStyleTuples);
};
