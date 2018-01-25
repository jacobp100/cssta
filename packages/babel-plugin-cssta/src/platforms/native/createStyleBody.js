/* eslint-disable no-param-reassign */
const t = require("babel-types");
const _ = require("lodash/fp");
const { transformStyleTuples } = require("cssta/src/native/cssUtil");
const { getPropertyName } = require("css-to-react-native");
const {
  getOrCreateImportReference,
  jsonToNode,
  containsSubstitution,
  getSubstitutionRegExp
} = require("../../util");
const simpleInterpolationMap = require("./simpleInterpolationMap");
const { getStringWithSubstitutedValues } = require("./util");

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

const createStyleTupleGroups = _.curry((path, substitutionMap, styleTuples) =>
  _.reduce(
    (groups, styleTuple) => {
      const interpolationType = getInterpolationType(
        substitutionMap,
        styleTuple
      );
      const lastGroup = _.last(groups);

      if (_.get("interpolationType", lastGroup) === interpolationType) {
        lastGroup.styleTuplesGroup.push(styleTuple);
      } else {
        groups.push({ interpolationType, styleTuplesGroup: [styleTuple] });
      }

      return groups;
    },
    [],
    styleTuples
  )
);

const createSimpleNoInterpolationStyleMap = (
  path,
  substitutionMap,
  styleTuplesGroup
) => {
  const substitutionRegExp = !_.isEmpty(substitutionMap)
    ? getSubstitutionRegExp(substitutionMap)
    : null;
  return _.reduce(
    (accum, [prop, value]) => {
      const propertyName = getPropertyName(prop);
      const substitutionMatches = substitutionRegExp
        ? value.match(substitutionRegExp)
        : null;

      if (!substitutionMatches) {
        const styles = transformStyleTuples([[propertyName, value]]);
        const styleToValue = _.mapValues(jsonToNode, styles);
        return _.assign(accum, styleToValue);
      } else if (substitutionMatches.length === 1) {
        const substitutionNode =
          substitutionMatches[0] === value.trim()
            ? substitutionMap[value]
            : getStringWithSubstitutedValues(substitutionMap, value);

        return _.set(
          propertyName,
          simpleInterpolationMap[propertyName](path, substitutionNode),
          accum
        );
      }

      throw new Error(
        `Used multiple values ${propertyName}, which accepts one value`
      );
    },
    {},
    styleTuplesGroup
  );
};

const transformStyleTupleGroup = _.curry(
  (path, substitutionMap, { styleTuplesGroup, interpolationType }) => {
    if (interpolationType === SIMPLE_OR_NO_INTERPOLATION) {
      const styleMap = createSimpleNoInterpolationStyleMap(
        path,
        substitutionMap,
        styleTuplesGroup
      );

      return t.objectExpression(
        _.map(
          ([key, value]) => t.objectProperty(t.stringLiteral(key), value),
          _.toPairs(styleMap)
        )
      );
    } else if (interpolationType === TEMPLATE_INTERPOLATION) {
      const cssToReactNativeReference = getOrCreateImportReference(
        path,
        "cssta/lib/native/cssUtil",
        "transformStyleTuples"
      );

      const bodyPairs = t.arrayExpression(
        _.map(
          ([prop, value]) =>
            t.arrayExpression([
              t.stringLiteral(getPropertyName(prop)),
              getStringWithSubstitutedValues(substitutionMap, value)
            ]),
          styleTuplesGroup
        )
      );

      return t.callExpression(cssToReactNativeReference, [bodyPairs]);
    }
    throw new Error("No interpolation type specified");
  }
);

module.exports = _.curry((path, substitutionMap, styleTuples) => {
  const transformedGroups = _.flow(
    createStyleTupleGroups(path, substitutionMap),
    _.map(transformStyleTupleGroup(path, substitutionMap))
  )(styleTuples);

  if (_.isEmpty(transformedGroups)) {
    return null;
  } else if (transformedGroups.length === 1) {
    return transformedGroups[0];
  }

  return t.callExpression(
    t.memberExpression(t.identifier("Object"), t.identifier("assign")),
    transformedGroups
  );
});
