const resolveVariableDependencies = require("../resolveVariableDependencies");

it("should resolve a single variable", () => {
  const actualVariables = resolveVariableDependencies({ color: "red" }, {});

  expect(actualVariables).toEqual({ color: "red" });
});

it("should resolve a variable refercing a higher scope", () => {
  const actualVariables = resolveVariableDependencies(
    { color: "var(--primary)" },
    { primary: "red" }
  );

  expect(actualVariables).toEqual({ color: "red" });
});

it("should resolve a variable refercing the current scope", () => {
  const actualVariables = resolveVariableDependencies(
    { color: "var(--primary)", primary: "red" },
    {}
  );

  expect(actualVariables).toEqual({ color: "red", primary: "red" });
});

it("have the current scope override higher scopes", () => {
  const actualVariables = resolveVariableDependencies(
    { color: "var(--primary)", primary: "red" },
    { primary: "blue" }
  );

  expect(actualVariables).toEqual({ color: "red", primary: "red" });
});

it("should allow defaults", () => {
  const actualVariables = resolveVariableDependencies(
    { color: "var(--primary, blue)" },
    {}
  );

  expect(actualVariables).toEqual({ color: "blue" });
});

it("should not allow circular dependencies", () => {
  expect(() => {
    resolveVariableDependencies(
      { color: "var(--primary)", primary: "var(--color)" },
      {}
    );
  }).toThrow();
});
