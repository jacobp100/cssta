export type TimingFunction =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out";

export type TransitionPart = {
  _?: string;
  delay?: string;
  duration?: string;
  property?: string;
  timingFunction?: string;
};

export type Transition = Array<{
  property: string;
  timingFunction: TimingFunction;
  delay: number;
  duration: number;
}>;

export type Keyframe = {
  time: number;
  style: Record<string, any>;
};

export type Keyframes = Record<string, Keyframe[]>;

export type AnimationPart = {
  _?: string;
  timingFunction?: string;
  delay?: string;
  duration?: string;
  iterations?: string;
  name?: string;
};

export type Animation = {
  delay: number;
  duration: number;
  iterations: number;
  name: string | null;
  timingFunction: TimingFunction;
};
