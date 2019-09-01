const { getPropertyName } = require("css-to-react-native");
const { transformStyleTuples } = require("../../../runtime/cssUtil");
const { jsonToNode, getOrCreateImport } = require("../util");
const {
  getSubstitutionRegExp,
  containsSubstitution,
  getStringWithSubstitutedValues
} = require("./substitutionUtil");
const simpleInterpolationMap = require("./simpleInterpolationMap");

const SIMPLE_OR_NO_INTERPOLATION = 0;
const TEMPLATE_INTERPOLATION = 1;

const getInterpolationType = (substitutionMap, [prop, value]) => {
  if (!containsSubstitution(substitutionMap, value)) {
    return SIMPLE_OR_NO_INTERPOLATION;
  } else if (getPropertyName(prop) in simpleInterpolationMap) {
    return SIMPLE_OR_NO_INTERPOLATION;
  }
  return TEMPLATE_INTERPOLATION;
};

const createStyleTupleGroups = (substitutionMap, styleTuples) => {
  const groups = [];
  styleTuples.forEach(styleTuple => {
    const interpolationType = getInterpolationType(substitutionMap, styleTuple);
    const lastGroup = groups[groups.length - 1];

    if (
      lastGroup != null &&
      lastGroup.interpolationType === interpolationType
    ) {
      lastGroup.styleTuplesGroup.push(styleTuple);
    } else {
      groups.push({ interpolationType, styleTuplesGroup: [styleTuple] });
    }
  }, []);
  return groups;
};

const createSimpleNoInterpolationStyleMap = (
  babel,
  path,
  substitutionMap,
  styleTuplesGroup
) => {
  const substitutionRegExp =
    Object.keys(substitutionMap).length !== 0
      ? getSubstitutionRegExp(substitutionMap)
      : null;

  const styleMap = {};

  styleTuplesGroup.forEach(([prop, value]) => {
    const propertyName = getPropertyName(prop);
    const substitutionMatches = substitutionRegExp
      ? value.match(substitutionRegExp)
      : null;

    if (substitutionMatches == null) {
      const styles = transformStyleTuples([[propertyName, value]]);

      Object.entries(styles).forEach(([key, value]) => {
        styleMap[key] = jsonToNode(babel, value);
      });
    } else if (substitutionMatches.length === 1) {
      const substitution =
        substitutionMatches[0] === value.trim()
          ? substitutionMap[value]
          : getStringWithSubstitutedValues(babel, substitutionMap, value);

      const simpleInterpolationFn = simpleInterpolationMap[propertyName];
      styleMap[propertyName] = simpleInterpolationFn(babel, path, substitution);
    } else {
      throw new Error(
        `Used multiple values ${propertyName}, which accepts one value`
      );
    }
  }, {});

  return styleMap;
};

const transformStyleTupleGroup = (
  babel,
  path,
  substitutionMap,
  { styleTuplesGroup, interpolationType }
) => {
  const { types: t } = babel;
  if (interpolationType === SIMPLE_OR_NO_INTERPOLATION) {
    const styleMap = createSimpleNoInterpolationStyleMap(
      babel,
      path,
      substitutionMap,
      styleTuplesGroup
    );

    return t.objectExpression(
      Object.entries(styleMap).map(([key, value]) =>
        t.objectProperty(t.identifier(key), value)
      )
    );
  } else if (interpolationType === TEMPLATE_INTERPOLATION) {
    const cssToReactNativeImport = getOrCreateImport(
      babel,
      path,
      "cssta/runtime/cssUtil",
      "transformStyleTuples"
    );

    const bodyPairs = t.arrayExpression(
      styleTuplesGroup.map(([prop, value]) =>
        t.arrayExpression([
          t.stringLiteral(getPropertyName(prop)),
          getStringWithSubstitutedValues(babel, substitutionMap, value)
        ])
      )
    );

    return t.callExpression(cssToReactNativeImport, [bodyPairs]);
  }
  throw new Error("No interpolation type specified");
};

module.exports = (babel, path, substitutionMap, styleTuples) => {
  const { types: t } = babel;
  const tupleGroups = createStyleTupleGroups(substitutionMap, styleTuples);
  const transformedGroups = tupleGroups.map(tupleGroup =>
    transformStyleTupleGroup(babel, path, substitutionMap, tupleGroup)
  );

  if (transformedGroups.length === 0) {
    return null;
  } else if (transformedGroups.length === 1) {
    return transformedGroups[0];
  }

  return t.callExpression(
    t.memberExpression(t.identifier("Object"), t.identifier("assign")),
    transformedGroups
  );
};
