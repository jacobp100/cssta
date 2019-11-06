module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {},
  overrides: [
    {
      files: ["**/__tests__/*.js"],
      env: {
        jest: true
      }
    }
  ]
};
