export const Easing = {
  linear: "linear",
  ease: "ease",
  bezier: (a: number, b: number, c: number, d: number) =>
    `bezier(${a}, ${b}, ${c}, ${d})`,
};

export class AnimatedNode {
  type: string;
  value: AnimatedNode | number;
  options?: any;

  constructor(type: string, value: AnimatedNode | number, options?: any) {
    this.type = type;
    this.value = value;

    if (options !== undefined) {
      this.options = options;
    }
  }

  start() {
    return this;
  }

  interpolate(options: any) {
    return new AnimatedNode("interpolate", this.value, options);
  }

  setValue() {
    return this;
  }
}

export const Animated = {
  Value: function (value: number) {
    return new AnimatedNode("value", value);
  },
  timing: (value: AnimatedNode, options: any) =>
    new AnimatedNode("timing", value, options),
  loop: (value: AnimatedNode, options: any) =>
    new AnimatedNode("loop", value, options),
  parallel: (value: AnimatedNode, options: any) =>
    new AnimatedNode("parallel", value, options),
  sequence: (value: AnimatedNode, options: any) =>
    new AnimatedNode("sequence", value, options),
};

export const StyleSheet = {
  flatten: (values: any) =>
    Array.isArray(values)
      ? Object.assign({}, ...values.map(StyleSheet.flatten))
      : values != null
      ? values
      : {},
};
