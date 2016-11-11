/* global jest it, expect */
const postcss = require('postcss');
const bodyTransform = require('../bodyTransform');

const runTest = (inputCss, expectedStyles) => {
  const nodes = postcss.parse(inputCss).nodes;
  const actualStyles = bodyTransform(nodes);
  expect(actualStyles).toEqual(expectedStyles);
};

it('transforms numbers', () => runTest(`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`, { top: 0, left: 0, right: 0, bottom: 0 }));

it('allows decimal values', () => runTest(`
  top: 1.5;
`, { top: 1.5 }));

it('transforms strings', () => runTest(`
  color: red;
`, { color: 'red' }));

it('transforms hex colors', () => runTest(`
  color: #f00;
`, { color: '#f00' }));

it('transforms rgb colors', () => runTest(`
  color: rgb(255, 0, 0);
`, { color: 'rgb(255, 0, 0)' }));

it('converts to camel-case', () => runTest(`
  border-width: 0;
`, { borderWidth: 0 }));

it('transforms font weights as strings', () => runTest(`
  font-weight: 400;
`, { fontWeight: '400' }));

it('transforms font variant as an array', () => runTest(`
  font-variant: tabular-nums;
`, { fontVariant: ['tabular-nums'] }));

it('transforms shadow offsets', () => runTest(`
  shadow-offset: 10 5;
`, { shadowOffset: { width: 10, height: 5 } }));

it('transforms a single transform value with number', () => runTest(`
  transform: scaleX(5);
`, { transform: [{ scaleX: 5 }] }));

it('transforms a single transform value with string', () => runTest(`
  transform: rotate(5deg);
`, { transform: [{ rotate: '5deg' }] }));

it('transforms multiple transform values', () => runTest(`
  transform: scaleX(5) skewX(1deg);
`, { transform: [{ skewX: '1deg' }, { scaleX: 5 }] }));

it('transforms scale(number, number) to scaleX and scaleY', () => runTest(`
  transform: scale(2, 3);
`, { transform: [{ scaleY: 3 }, { scaleX: 2 }] }));

it('transforms scale(number) to scaleX and scaleY', () => runTest(`
  transform: scale(5);
`, { transform: [{ scaleY: 5 }, { scaleX: 5 }] }));

it('transforms skew(number, number) to skewX and skewY', () => runTest(`
  transform: skew(2deg, 3deg);
`, { transform: [{ skewY: '3deg' }, { skewX: '2deg' }] }));

it('transforms skew(number) to skewX and skewY', () => runTest(`
  transform: skew(5deg);
`, { transform: [{ skewY: '5deg' }, { skewX: '5deg' }] }));
