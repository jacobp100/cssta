module.exports = {
    "extends": "airbnb-base",
    "installedESLint": true,
    "plugins": [
        "import"
    ],
    "rules": {
        "react/jsx-filename-extension": [0],
        "comma-dangle": ["error", {
            arrays: "always-multiline",
            objects: "always-multiline",
            imports: "always-multiline",
            exports: "always-multiline",
            functions: "never",
        }],
    }
};
