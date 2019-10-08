import viewport from "../viewport";

it("Transforms viewport units", () => {
  const actual = viewport("10vw 10vh", { width: 100, height: 200 });
  expect(actual).toBe("10px 20px");
});

it("Transforms viewport min/max units", () => {
  const actual = viewport("10vmin 10vmax", { width: 100, height: 200 });
  expect(actual).toBe("10px 20px");
});
