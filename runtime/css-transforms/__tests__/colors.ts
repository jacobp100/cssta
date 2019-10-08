import colors from "../colors";

it("Converts colors", () => {
  const actual = colors("color(red lightness(25%))");
  expect(actual).toBe("rgb(128, 0, 0)");
});

it("Converts colors that contain rgb", () => {
  const actual = colors("color(rgb(255, 0, 0) lightness(25%))");
  expect(actual).toBe("rgb(128, 0, 0)");
});
