import { getPropertyName } from "css-to-react-native";
import { transformStyleTuples, StyleTuple } from "../../../runtime/cssUtil";
import { SubstitutionMap } from "../extractSubstitutionMap";
import { jsonToNode, getOrCreateImport } from "../util";
import {
  getSubstitutionRegExp,
  containsSubstitution,
  getStringWithSubstitutedValues
} from "./substitutionUtil";
import unitTypes from "./simpleUnitTypes";
import substituteSimpleUnit from "./substituteSimpleUnit";
import { calcRe } from "./util";

enum InterpolationType {
  NoOrSimple,
  Template
}

type StyleTupleGroup = {
  interpolationType: InterpolationType;
  styleTuplesGroup: StyleTuple[];
};

const getInterpolationType = (
  substitutionMap: SubstitutionMap,
  [prop, value]: StyleTuple
) => {
  if (!containsSubstitution(substitutionMap, value)) {
    return InterpolationType.NoOrSimple;
  } else if (getPropertyName(prop) in unitTypes && !calcRe.test(value)) {
    return InterpolationType.NoOrSimple;
  }
  return InterpolationType.Template;
};

const createStyleTupleGroups = (
  substitutionMap: SubstitutionMap,
  styleTuples: StyleTuple[]
) => {
  const groups = [] as StyleTupleGroup[];
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
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  styleTuplesGroup: StyleTuple[]
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

      styleMap[propertyName] = substituteSimpleUnit(
        babel,
        path,
        propertyName,
        substitution
      );
    } else {
      throw new Error(
        `Used multiple values ${propertyName}, which accepts one value`
      );
    }
  }, {});

  return styleMap;
};

const transformStyleTupleGroup = (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  { styleTuplesGroup, interpolationType }: StyleTupleGroup
) => {
  const { types: t } = babel;
  if (interpolationType === InterpolationType.NoOrSimple) {
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
  } else if (interpolationType === InterpolationType.Template) {
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

export default (
  babel: any,
  path: any,
  substitutionMap: SubstitutionMap,
  styleTuples: StyleTuple[]
) => {
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
