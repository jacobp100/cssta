/* global it expect */
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { transformFileSync } = require('babel-core');
const tempfile = require('tempfile');
const plugin = require('.');

const approve = process.argv.includes('--approve');
const skipTest = process.argv.includes('--skip-test');

const normaliseCss = (str) => {
  let output = str;
  do {
    output = output.replace(__dirname, '<dirname>');
  } while (output.indexOf(__dirname) !== -1);
  return output;
};

const getActual = (actualJsPath, tempCssPath) => {
  plugin.resetGenerators();

  const actualJs = transformFileSync(actualJsPath, {
    plugins: [[plugin, { output: tempCssPath }]],
  }).code;

  let actualCss = fs.existsSync(tempCssPath)
    ? fs.readFileSync(tempCssPath, 'utf8')
    : '';
  actualCss = normaliseCss(actualCss);

  return { actualJs, actualCss };
};

glob.sync(path.join(__dirname, 'fixtures/*/')).forEach((testPath) => {
  const testName = path.dirname(testPath);

  const expectedJsPath = path.join(testPath, 'expected.js');
  const expectedCssPath = path.join(testPath, 'expected.css');
  const actualJsPath = path.join(testPath, 'actual.js');
  const tempCssPath = tempfile('.css');

  if (approve) {
    const { actualJs, actualCss } = getActual(actualJsPath, tempCssPath);
    const options = { flag: 'w+', encoding: 'utf8' };
    fs.writeFileSync(expectedJsPath, actualJs, options);
    fs.writeFileSync(expectedCssPath, actualCss, options);
  } else if (skipTest) {
    getActual(actualJsPath, tempCssPath);
  } else {
    it(`should work with ${testName}`, () => {
      const { actualJs, actualCss } = getActual(actualJsPath, tempCssPath);
      const expectedJs = fs.readFileSync(expectedJsPath, 'utf8');
      const expectedCss = fs.readFileSync(expectedCssPath, 'utf8');

      expect(actualJs.trim()).toEqual(expectedJs.trim());
      expect(actualCss.trim()).toEqual(expectedCss.trim());
    });
  }
});
