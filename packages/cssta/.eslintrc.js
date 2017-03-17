module.exports = {
    "extends": "airbnb-base",
    "installedESLint": true,
    "plugins": [
        "import",
        "flowtype"
    ],
    "rules": {
        "react/jsx-filename-extension": [0],
        "flowtype/require-valid-file-annotation": [2, "always"],
        "comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],
        "spaced-comment": [0],
        "arrow-parens": [0]
    }
};
