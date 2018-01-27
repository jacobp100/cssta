const Benchmark = require('benchmark');
require('console.table'); // eslint-disable-line
const testFunctions = require('./tests-compiled').default;

// Benchmark.options.onError = e => console.error(e);

const suite = new Benchmark.Suite();

const tests = Object.keys(testFunctions);
const contestantsSet = new Set();

const getRunName = (testName, contestant) => `${testName}: ${contestant}`;

tests.forEach((testName) => {
  Object.keys(testFunctions[testName]).forEach((contestant) => {
    contestantsSet.add(contestant);
    suite.add(getRunName(testName, contestant), testFunctions[testName][contestant]);
  });
});

const contestants = Array.from(contestantsSet);

suite.on('complete', () => {
  const suiteResults = Array.from(suite);

  const header = [''].concat(contestants);
  const rows = tests.map(testName => (
    [testName].concat(contestants.map((contestant) => {
      const runName = getRunName(testName, contestant);
      const run = suiteResults.find(run => run.name === runName); // eslint-disable-line
      return run
        ? `${(run.stats.mean * 1000).toFixed(3)}±${(run.stats.deviation * 1000).toFixed(3)}ms`
        : '-';
    }))
  ));

  console.table(header, rows);
});

suite.run();
