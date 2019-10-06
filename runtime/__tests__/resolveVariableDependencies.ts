import resolveVariableDependencies from "../resolveVariableDependencies";

it("Resolves a single variable", () => {
  const actualVariables = resolveVariableDependencies({ color: "red" }, {});

  expect(actualVariables).toEqual({ color: "red" });
});

it("Resolves a variable refercing a higher scope", () => {
  const actualVariables = resolveVariableDependencies(
    { primary: "red" },
    { color: "var(--primary)" }
  );

  expect(actualVariables).toEqual({ primary: "red", color: "red" });
});

it("Resolves a variable refercing the current scope", () => {
  const actualVariables = resolveVariableDependencies(
    {},
    { color: "var(--primary)", primary: "red" }
  );

  expect(actualVariables).toEqual({ color: "red", primary: "red" });
});

it("Has the current scope override higher scopes", () => {
  const actualVariables = resolveVariableDependencies(
    { primary: "blue" },
    { color: "var(--primary)", primary: "red" }
  );

  expect(actualVariables).toEqual({ color: "red", primary: "red" });
});

it("Allows defaults", () => {
  const actualVariables = resolveVariableDependencies(
    { color: "var(--primary, blue)" },
    {}
  );

  expect(actualVariables).toEqual({ color: "blue" });
});

it("Throws on allow circular dependencies", () => {
  expect(() => {
    resolveVariableDependencies(
      { color: "var(--primary)", primary: "var(--color)" },
      {}
    );
  }).toThrow();
});
