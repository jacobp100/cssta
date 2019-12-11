import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

export default (): { width: number; height: number } => {
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    setDimensions(Dimensions.get("window"));

    const listener = ({ window }) => {
      setDimensions(window);
    };
    Dimensions.addEventListener("change", listener);

    return () => Dimensions.removeEventListener("change", listener);
  }, []);

  return dimensions;
};
