// @flow
const { easingFunctions } = require("./animationUtil");
const { getDurationInMs, durationRegExp } = require("./animationShorthandUtil");

/*::
import type { TimingFunction } from "./animationShorthandUtil";

export type AnimationShorthandParts = Array<{
  _?: string,
  timingFunction?: string,
  delay?: string,
  duration?: string,
  iterations?: string,
  name?: string
}>;

export type Animation = {
  delay: number,
  duration: number,
  iterations: number,
  name: string | null,
  timingFunction: TimingFunction
};
*/

const iterationsRegExp = /^(\d+|infinite)$/i;

const getIterationCount = (iteration /*: string */) /*: number */ =>
  /infinite/i.test(iteration) ? -1 : parseInt(iteration, 10);

const defaultValue = () /*: Animation */ => ({
  delay: 0,
  duration: 0,
  iterations: 1,
  name: null,
  timingFunction: "ease"
});

const TIMING_FUNCTION = 1 << 0;
const DURATION = 1 << 1;
const DELAY = 1 << 2;
const ITERATION_COUNT = 1 << 3;
const NAME = 1 << 4;

const getAnimationShorthand = (shorthandParts /*: string[] */) => {
  const accum = defaultValue();
  let set = 0;

  shorthandParts.forEach(part => {
    if (!(set & TIMING_FUNCTION) && easingFunctions[part] != null) {
      // $FlowFixMe;
      accum.timingFunction = part;
      set &= TIMING_FUNCTION;
    } else if (!(set & DURATION) && durationRegExp.test(part)) {
      accum.duration = getDurationInMs(part);
      set &= DURATION;
    } else if (!(set & DELAY) && durationRegExp.test(part)) {
      accum.delay = getDurationInMs(part);
      set &= DURATION;
    } else if (!(set & ITERATION_COUNT) && iterationsRegExp.test(part)) {
      accum.iterations = getIterationCount(part);
      set &= ITERATION_COUNT;
    } else if (!(set & NAME)) {
      accum.name = part;
      set &= NAME;
    } else {
      throw new Error("Failed to parse shorthand");
    }
  });

  return accum;
};

module.exports = (styles /*: AnimationShorthandParts */) /*: Animation */ => {
  let accum = defaultValue();
  styles.forEach(style => {
    if (style == null) return;

    if (style._ != null) {
      accum = getAnimationShorthand(style._.trim().split(/\s+/));
    }
    if (style.timingFunction != null) {
      // $FlowFixMe
      accum.timingFunction = style.timingFunction;
    }
    if (style.delay != null) {
      accum.delay = getDurationInMs(style.delay);
    }
    if (style.duration != null) {
      accum.duration = getDurationInMs(style.duration);
    }
    if (style.iterations != null) {
      accum.iterations = getIterationCount(style.iterations);
    }
    if (style.name != null) {
      accum.name = style.name !== "none" ? style.name : null;
    }
  });
  return accum;
};
