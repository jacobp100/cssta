import { varRegExp } from "../cssRegExp";

export default (
  value: string,
  appliedVariables: { [key: string]: string }
): string =>
  value.replace(
    varRegExp,
    (_, variableName, fallback) => appliedVariables[variableName] || fallback
  );
