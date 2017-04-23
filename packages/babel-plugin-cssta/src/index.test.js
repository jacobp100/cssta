/* global it expect */
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { transformFileSync } = require('babel-core');
const tempfile = require('tempfile');
const plugin = require('.');

const approve = process.argv.includes('--approve');
const printJs = process.argv.includes('--print-js');
const printCss = process.argv.includes('--print-css');
const filterIndex = process.argv.indexOf('--filter');
const filter = filterIndex === -1 ? '' : process.argv[filterIndex + 1];
const baseDir = path.join(__dirname, '..');

const normaliseCss = (str) => {
  let output = str;
  do {
    output = output.replace(baseDir, '<dirname>');
  } while (output.indexOf(baseDir) !== -1);
  return output;
};

const getMockCssPath = () => tempfile('.css');

const getActual = (testPath, actualJsPath, optionsPath) => {
  plugin.resetGenerators();

  const dummyCssPath = getMockCssPath();
  const options = { output: dummyCssPath, cwd: testPath };

  if (fs.existsSync(optionsPath)) {
    const userOptions = JSON.parse(fs.readFileSync(optionsPath, 'utf8'));
    Object.assign(options, userOptions);
  }

  const actualJs = transformFileSync(actualJsPath, {
    plugins: [[plugin, options]],
  }).code;

  let actualCss = fs.existsSync(dummyCssPath)
    ? fs.readFileSync(dummyCssPath, 'utf8')
    : '';
  actualCss = normaliseCss(actualCss);

  return { actualJs, actualCss };
};

glob.sync(path.join(baseDir, 'fixtures/*/')).filter(name => (
  !filter || name.indexOf(filter) !== -1
)).forEach((testPath) => {
  const testName = path.relative(path.join(baseDir, 'fixtures'), testPath);

  const expectedJsPath = path.join(testPath, 'expected.js');
  const expectedCssPath = path.join(testPath, 'expected.css');
  const actualJsPath = path.join(testPath, 'actual.js');
  const optionsPath = path.join(testPath, 'options.json');

  if (global.it) {
    it(`should work with ${testName}`, () => {
      const { actualJs, actualCss } = getActual(testPath, actualJsPath, optionsPath);
      const expectedJs = fs.readFileSync(expectedJsPath, 'utf8');
      const expectedCss = actualCss && fs.readFileSync(expectedCssPath, 'utf8');

      expect(actualJs.trim()).toEqual(expectedJs.trim());
      if (actualCss) expect(actualCss.trim()).toEqual(expectedCss.trim());
    });
  } else {
    const { actualJs, actualCss } = getActual(testPath, actualJsPath, optionsPath);

    if (approve) {
      const options = { flag: 'w+', encoding: 'utf8' };
      fs.writeFileSync(expectedJsPath, actualJs, options);
      if (actualCss) fs.writeFileSync(expectedCssPath, actualCss, options);
    }

    if (printJs) console.log(actualJs); // eslint-disable-line
    if (printCss) console.log(actualCss); // eslint-disable-line
  }
});
