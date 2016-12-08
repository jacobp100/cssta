/* global it expect */
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { transformFileSync } = require('babel-core');
const tempfile = require('tempfile');
const plugin = require('.');

const approve = process.argv.includes('--approve');
const skipTest = process.argv.includes('--skip-test');

const baseDir = path.join(__dirname, '..');

const normaliseCss = (str) => {
  let output = str;
  do {
    output = output.replace(baseDir, '<dirname>');
  } while (output.indexOf(baseDir) !== -1);
  return output;
};

const getActual = (testPath, actualJsPath, tempCssPath, optionsPath) => {
  plugin.resetGenerators();

  const options = { output: tempCssPath, cwd: testPath };

  if (fs.existsSync(optionsPath)) {
    const userOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
    Object.assign(options, userOptions);
  }

  const actualJs = transformFileSync(actualJsPath, {
    plugins: [[plugin, options]],
  }).code;

  let actualCss = fs.existsSync(tempCssPath)
    ? fs.readFileSync(tempCssPath, 'utf8')
    : '';
  actualCss = normaliseCss(actualCss);

  return { actualJs, actualCss };
};

glob.sync(path.join(baseDir, 'fixtures/*/')).forEach((testPath) => {
  const testName = path.relative(path.join(baseDir, 'fixtures'), testPath);

  const expectedJsPath = path.join(testPath, 'expected.js');
  const expectedCssPath = path.join(testPath, 'expected.css');
  const actualJsPath = path.join(testPath, 'actual.js');
  const tempCssPath = tempfile('.css');
  const optionsPath = path.join(testPath, 'options.json');

  if (approve) {
    const { actualJs, actualCss } = getActual(testPath, actualJsPath, tempCssPath, optionsPath);
    const options = { flag: 'w+', encoding: 'utf8' };
    fs.writeFileSync(expectedJsPath, actualJs, options);
    if (actualCss) fs.writeFileSync(expectedCssPath, actualCss, options);
  } else if (skipTest) {
    getActual(actualJsPath, tempCssPath, optionsPath);
  } else {
    it(`should work with ${testName}`, () => {
      const { actualJs, actualCss } = getActual(testPath, actualJsPath, tempCssPath, optionsPath);
      const expectedJs = fs.readFileSync(expectedJsPath, 'utf8');
      const expectedCss = actualCss && fs.readFileSync(expectedCssPath, 'utf8');

      expect(actualJs.trim()).toEqual(expectedJs.trim());
      if (actualCss) expect(actualCss.trim()).toEqual(expectedCss.trim());
    });
  }
});
