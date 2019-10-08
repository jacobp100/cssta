import { viewportUnitRegExp } from "../cssRegExp";

export default (
  value: string,
  { width, height }: { width: number; height: number }
): string =>
  value.replace(viewportUnitRegExp, (m, value, unit) => {
    switch (unit) {
      case "vw":
        return (Number(value) * width) / 100 + "px";
      case "vh":
        return (Number(value) * height) / 100 + "px";
      case "vmin":
        return (Number(value) * Math.min(width, height)) / 100 + "px";
      case "vmax":
        return (Number(value) * Math.max(width, height)) / 100 + "px";
      default:
        return m;
    }
  });
