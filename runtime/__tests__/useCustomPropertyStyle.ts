import React from "react";
import { create } from "react-test-renderer";
import useCustomProperties from "../useCustomProperties";
import useCustomPropertyStyle from "../useCustomPropertyStyle";
import VariablesContext from "../VariablesContext";

it("Converts style tuples and variables into a style object", () => {
  const styleTuples: [string, string][] = [
    ["color", "red"],
    ["margin", "var(--small)"]
  ];

  let style: any;
  const Component = () => {
    const customProperties = useCustomProperties();
    style = useCustomPropertyStyle(styleTuples, customProperties);
    return null;
  };

  const instance = create(
    React.createElement(
      VariablesContext.Provider,
      { value: { small: "10px" } },
      React.createElement(Component)
    )
  );

  expect(style).toEqual({
    color: "red",
    marginTop: 10,
    marginRight: 10,
    marginBottom: 10,
    marginLeft: 10
  });

  instance.unmount();
});
