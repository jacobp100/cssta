export const getDurationInMs = (duration: string): number => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

export const durationRegExp = /^[\d.]+m?s$/;

export const easingRegExp = /^(linear|ease(?:-in)?(?:-out)+)$/i;
