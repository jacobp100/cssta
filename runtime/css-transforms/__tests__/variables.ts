import variables from "../variables";

it("Handles multiple variables", () => {
  const actual = variables("var(--a) var(--b)", { a: "1px", b: "2px" });
  expect(actual).toEqual("1px 2px");
});
