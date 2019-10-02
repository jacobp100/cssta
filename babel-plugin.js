const processNative = require("./compiler/babel/build");

const csstaModules = {
  "cssta/native": "native"
};

const getCsstaTypeForCallee = ({ types: t }, path) => {
  if (path == null) return null;

  const callee = path.node;

  if (!t.isIdentifier(callee)) return null;

  const importSpecifierHub = path.scope.getBinding(callee.name);
  const importSpecifier =
    importSpecifierHub != null ? importSpecifierHub.path : null;
  if (importSpecifier == null || !t.isImportDefaultSpecifier(importSpecifier)) {
    return null;
  }

  const importDeclaration = importSpecifier.findParent(t.isImportDeclaration);
  if (importDeclaration == null) return null;

  const source = importDeclaration.node.source.value;
  const csstaType = csstaModules[source];
  if (csstaType == null) return null;

  return csstaType;
};

const removeCsstaImports = {
  ImportDeclaration(importPath) {
    if (csstaModules[importPath.node.source.value] != null) {
      importPath.remove();
    }
  }
};

module.exports = babel => ({
  name: "cssta",
  visitor: {
    Program: {
      exit(programPath) {
        programPath.traverse(removeCsstaImports);
      }
    },
    TaggedTemplateExpression(path, state) {
      switch (getCsstaTypeForCallee(babel, path.get("tag.callee"))) {
        case "native": {
          const element = path.get("tag.arguments.0").node;
          const css = path.get("quasi").node;
          processNative(babel, path, state.opts, element, css);
          break;
        }
        default:
          break;
      }
    }
  }
});
