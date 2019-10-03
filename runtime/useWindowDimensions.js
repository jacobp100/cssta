// @flow
const React = require("react");
const { Dimensions } = require("react-native");

module.exports = () /*: { width: number, height: number } */ => {
  const [dimensions, setDimensions] = React.useState(Dimensions.get("window"));

  React.useEffect(() => {
    setDimensions(Dimensions.get("window"));

    const listener = ({ window }) => {
      setDimensions(window);
    };
    Dimensions.addEventListener("change", listener);

    return () => Dimensions.removeEventListener("change", listener);
  }, [setDimensions]);

  return dimensions;
};
