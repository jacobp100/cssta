module.exports = {
  extends: ["airbnb-base", "prettier"],
  plugins: ["import", "react", "flowtype"],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    }
  },
  rules: {
    "react/jsx-filename-extension": [0],
    "react/jsx-uses-react": [2],
    "react/jsx-uses-vars": [2],
    "spaced-comment": [0],
    "arrow-parens": [0]
  },
  overrides: [
    {
      files: "src/**/*.js",
      rules: {
        "flowtype/require-valid-file-annotation": [2, "always"]
      }
    },
    {
      files: "**/__tests__/*.js",
      env: { jest: true },
      rules: {
        "flowtype/require-valid-file-annotation": [0]
      }
    }
  ]
};
