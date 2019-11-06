// Two levels of nesting
const calcFnRe = /calc\(((?:[^(]|\((?:[^(]|\([^(]+\))+\))+)\)/g;
const bracketsRe = /\(([^)]+)\)/g;
const addSubtractRe = /([^+-]+)([+-])(.*)/;
const multiplyDivideRe = /([^*/]+)([*/])(.*)/;
const unitRe = /([\d.]+)(px|)/;

type Node = { value: number; unit: "" | "px" };

const resolveValue = (value: string): Node | null => {
  const match = value.match(unitRe);
  if (match === null) return null;
  return { value: Number(match[1]), unit: match[2] as any };
};

const resolveMultiplyDivide = (value: string): Node | null => {
  const match = value.match(multiplyDivideRe);
  if (match === null) return resolveValue(value);

  const lhs = resolveValue(match[1]);
  if (lhs === null) return null;
  const rhs = resolveMultiplyDivide(match[3]);
  if (rhs === null) return null;

  if (match[2] === "*") {
    if (lhs.unit.length === 0) {
      return { value: lhs.value * rhs.value, unit: rhs.unit };
    } else if (rhs.unit.length === 0) {
      return { value: lhs.value * rhs.value, unit: lhs.unit };
    }
  } else if (match[2] === "/") {
    if (rhs.unit.length === 0) {
      return { value: lhs.value / rhs.value, unit: lhs.unit };
    }
  }

  return null;
};

const resolveAddSubtract = (value: string): Node | null => {
  const match = value.match(addSubtractRe);
  if (match === null) return resolveMultiplyDivide(value);

  const lhs = resolveMultiplyDivide(match[1]);
  if (lhs === null) return null;
  const rhs = resolveAddSubtract(match[3]);
  if (rhs === null) return null;

  if (lhs.unit !== rhs.unit) return null;

  return {
    value: match[2] === "+" ? lhs.value + rhs.value : lhs.value - rhs.value,
    unit: lhs.unit
  };
};

const resolveBrackets = (value: string): string => {
  const out = value.replace(bracketsRe, (_, inner) => resolveBrackets(inner));
  const node = resolveAddSubtract(out);

  if (node !== null) {
    return `${node.value}${node.unit}`;
  } else {
    throw new Error("Failed to parse calc");
  }
};

export default (inputValue: string): string => {
  let value = inputValue;
  let didReplace: boolean;
  do {
    didReplace = false;
    value = value.replace(calcFnRe, (_, rest) => {
      didReplace = true;
      return resolveBrackets(rest);
    });
  } while (didReplace);
  return value;
};
