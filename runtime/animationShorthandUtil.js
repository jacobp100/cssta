module.exports.getDurationInMs = (duration /*: string */) /*: number */ => {
  const time = parseFloat(duration);
  const factor = /ms$/i.test(duration) ? 1 : 1000;
  return time * factor;
};

module.exports.durationRegExp = /^[\d.]+m?s$/;
module.exports.easingRegExp = /^(linear|ease(?:-in)?(?:-out)+)$/i;
