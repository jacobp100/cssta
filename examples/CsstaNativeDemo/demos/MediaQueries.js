import React from "react";
import { View, Text } from "react-native";
import cssta from "cssta/native";

const Container = cssta(View)`
  flex-direction: row;
`;

const Example = cssta(View)`
  flex: 1;
  padding: 10px;
  background: var(--background);
  border-radius: 1000px;
  --background: white;
  --color: black;

  @media (orientation: landscape) {
    &:not([@portrait]) {
      --background: blue;
      --color: white;
    }
  }

  @media (orientation: portrait) {
    &[@portrait] {
      --background: blue;
      --color: white;
    }
  }
`;

const Example2 = cssta(View)`
  width: 20px;
  height: 20px;
  background: red;

  @media (orientation: portrait) {
    background: blue;
  }
`;

const ExampleText = cssta(Text)`
  color: var(--color);
  text-align: center;
`;

export default () => (
  <Container>
    <Example>
      <ExampleText>Landscape</ExampleText>
    </Example>
    <Example portrait>
      <ExampleText>Portrait</ExampleText>
    </Example>
    <Example2 />
  </Container>
);

export const code = "color: color(red tint(50%));";
