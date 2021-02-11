/* eslint-disable no-param-reassign */
import { AtRule, Rule, Node, Declaration } from "postcss";
import { TransitionPart, AnimationPart } from "../../runtime/animationTypes";
import { StyleTuple } from "../../runtime/cssUtil";
import { varRegExp, varRegExpNonGlobal } from "../../runtime/cssRegExp";
import getRoot from "./getRoot";
import applyGlobals from "./applyGlobals";
import { isDirectChildOfKeyframes } from "./util";
import {
  Condition,
  StyleDeclaration,
  TransitionDeclaration,
  AnimationDeclaration,
  VariableExportDeclaration,
  KeyframeOfStyleTuples,
  KeyframesDeclaration,
  ComponentDefinition,
  StyleType,
} from "./types";

const walkToArray = <T>(
  walker: (callback: (node: Node) => void) => void
): T[] => {
  const nodes = [];
  walker((node) => nodes.push(node));
  return nodes;
};

const getStyleTuples = (nodes: Node[]): StyleTuple[] =>
  nodes
    .filter((node) => node.type === "decl")
    .map((node: Declaration) => [node.prop, node.value]);

const getStyleTuplesImportedVariables = (
  styleTuples: StyleTuple[]
): string[] => {
  const importedVariablesSet = new Set<string>();

  styleTuples.forEach((tuple) => {
    const referencedVariableMatches = tuple[1].match(varRegExp);
    if (referencedVariableMatches == null) return;

    referencedVariableMatches.forEach((match) => {
      importedVariablesSet.add(match.match(varRegExpNonGlobal)[1]);
    });
  });

  const importedVariables = Array.from(importedVariablesSet);

  return importedVariables;
};

const transitionAttributes: Record<string, keyof TransitionPart> = {
  transition: "_",
  "transition-delay": "delay",
  "transition-duration": "duration",
  "transition-property": "property",
  "transition-timing-function": "timingFunction",
};

const animationAttributes: Record<string, keyof AnimationPart> = {
  animation: "_",
  "animation-delay": "delay",
  "animation-duration": "duration",
  "animation-name": "name",
  "animation-timing-function": "timingFunction",
  "animation-iteration-count": "iterations",
};

const getTransitionAnimationParts = <T>(
  styleTuples: StyleTuple[],
  attributes: Record<string, keyof T>
): Record<keyof T, string> => {
  let accum = {} as Record<keyof T, string>;

  styleTuples.forEach(([key, value]) => {
    const attributeKey: keyof T | undefined = attributes[key];
    if (attributeKey === "_") {
      accum = { ["_" as keyof T]: value } as Record<keyof T, string>;
    } else if (attributeKey !== undefined) {
      accum[attributeKey] = value;
    } else {
      throw new Error("Missing key");
    }
  });

  return accum;
};

const getCondition = (rule: Rule): Condition | null => {
  const { selector } = rule;

  let mediaQuery = null;
  if (
    rule.parent &&
    rule.parent.type === "atrule" &&
    rule.parent.name === "media"
  ) {
    mediaQuery = rule.parent.params;
  }

  return selector !== "&" || mediaQuery ? { selector, mediaQuery } : null;
};

const filteredStyleTuples = (
  declarationRules: Rule[],
  fn: (property: string) => boolean
): Array<{
  condition: Condition;
  styleTuples: StyleTuple[];
}> => {
  return declarationRules
    .map((rule) => {
      const styleTuples = getStyleTuples(rule.nodes).filter((styleTuple) =>
        fn(styleTuple[0])
      );
      return { condition: getCondition(rule), styleTuples };
    })
    .filter((style) => style.styleTuples.length > 0);
};

const getStyleTuplesMixinsForRule = (rule: Rule): StyleDeclaration[] => {
  const condition = getCondition(rule);
  const groups: StyleDeclaration[] = [];
  let currentStyleTuples = null;

  rule.nodes.forEach((node) => {
    switch (node.type) {
      case "decl": {
        const { prop, value } = node;

        if (
          prop in animationAttributes ||
          prop in transitionAttributes ||
          prop.startsWith("--")
        ) {
          return;
        }

        if (currentStyleTuples == null) {
          currentStyleTuples = {
            type: StyleType.Tuples,
            condition,
            styleTuples: [],
            // Set imported variables after
            importedVariables: null as any,
          };
          groups.push(currentStyleTuples);
        }
        currentStyleTuples.styleTuples.push([prop, value]);
        break;
      }
      case "atrule": {
        if ((node as AtRule).name !== "include") {
          return;
        }

        currentStyleTuples = null;
        groups.push({
          type: StyleType.Mixin,
          condition,
          substitution: (node as AtRule).params,
        });
      }
    }
  });

  groups.forEach((group) => {
    if (group.type === StyleType.Tuples) {
      group.importedVariables = getStyleTuplesImportedVariables(
        group.styleTuples
      );
    }
  });

  return groups;
};

const getKeyframes = (atRule: AtRule): KeyframesDeclaration => {
  const sequence = walkToArray<Rule>((cb) => atRule.walkRules(cb))
    .reduce((accum: KeyframeOfStyleTuples[], rule) => {
      const timeSelectors = rule.selector
        .split(",")
        .map((selector) => selector.trim())
        .map((selector) => {
          if (/[\d.]%/.test(selector)) return parseFloat(selector) / 100;
          if (/from/i.test(selector)) return 0;
          if (/to/i.test(selector)) return 1;
          throw new Error(`Cannot parse keyframe time: ${selector}`);
        });

      const styleTuples = getStyleTuples(
        walkToArray<Declaration>((cb) => rule.walkDecls(cb))
      );

      const newKeyframeBlocks: KeyframeOfStyleTuples[] = timeSelectors.map(
        (time) => ({
          time,
          styleTuples,
        })
      );
      return accum.concat(newKeyframeBlocks);
    }, [])
    .sort((a, b) => a.time - b.time);

  const allStyleTuples: StyleTuple[] = sequence.reduce(
    (accum, frame) => accum.concat(frame.styleTuples),
    []
  );
  const importedVariables = getStyleTuplesImportedVariables(allStyleTuples);
  const name = atRule.params;

  return { name, sequence, importedVariables };
};

export default (inputCss: string, globals?: any): ComponentDefinition => {
  const { root, propTypes } = getRoot(inputCss);
  if (globals != null) applyGlobals(root, globals);

  const declarationRules = walkToArray<Rule>((cb) => root.walkRules(cb)).filter(
    (rule) => !isDirectChildOfKeyframes(rule)
  );

  const styles: StyleDeclaration[] = declarationRules
    .reduce(
      (accum, rule) => accum.concat(getStyleTuplesMixinsForRule(rule)),
      []
    )
    .filter(
      (style) =>
        style.type === StyleType.Mixin || style.styleTuples.length !== 0
    );

  const transitions: TransitionDeclaration[] = filteredStyleTuples(
    declarationRules,
    (property) => property in transitionAttributes
  ).map(({ condition, styleTuples }) => ({
    condition,
    part: getTransitionAnimationParts(styleTuples, transitionAttributes),
    importedVariables: getStyleTuplesImportedVariables(styleTuples),
  }));

  const animations: AnimationDeclaration[] = filteredStyleTuples(
    declarationRules,
    (property) => property in animationAttributes
  ).map(({ condition, styleTuples }) => ({
    condition,
    part: getTransitionAnimationParts(styleTuples, animationAttributes),
    importedVariables: getStyleTuplesImportedVariables(styleTuples),
  }));

  const keyframes: KeyframesDeclaration[] = walkToArray<AtRule>((cb) =>
    root.walkAtRules(cb)
  )
    .filter((atRule) => atRule.name === "keyframes")
    .map(getKeyframes);

  const exportedVariables: VariableExportDeclaration[] = filteredStyleTuples(
    declarationRules,
    (property) => property.startsWith("--")
  ).reduce((accum, { condition, styleTuples }) => {
    const declarations = styleTuples.map((styleTuple) => {
      const importedVariables = getStyleTuplesImportedVariables([styleTuple]);
      const name = styleTuple[0].substring("--".length);
      const value = styleTuple[1];
      return { condition, name, value, importedVariables };
    });
    return accum.concat(declarations);
  }, []);

  return {
    propTypes,
    styles,
    transitions,
    animations,
    keyframes,
    exportedVariables,
  };
};
