const { default: buildElement } = require("./compiler/babel/buildElement");
const { default: buildMixin } = require("./compiler/babel/buildMixin");

const csstaModules = {
  "cssta/native": "native"
};

const getCsstaTypeForCallee = ({ types: t }, path) => {
  if (path == null) return null;

  const { node } = path;
  const csstaIdentifier = t.isCallExpression(node)
    ? node.callee
    : t.isMemberExpression(node)
    ? node.object
    : null;

  if (!t.isIdentifier(csstaIdentifier)) return null;

  const importSpecifierHub = path.scope.getBinding(csstaIdentifier.name);
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
      switch (getCsstaTypeForCallee(babel, path.get("tag"))) {
        case "native": {
          const { types: t } = babel;
          const tag = path.node.tag;
          const css = path.get("quasi").node;

          if (
            t.isMemberExpression(tag) &&
            t.isIdentifier(tag.property, { name: "mixin" })
          ) {
            buildMixin(babel, path, css, state.opts);
          } else if (t.isCallExpression(tag)) {
            const element = path.get("tag.arguments.0").node;
            buildElement(babel, path, element, css, state.opts);
          }
          break;
        }
        default:
          break;
      }
    }
  }
});
