import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import cssta from "cssta/native";
import Basic, { code as basicCode } from "./demos/Basic";
import Animations, { code as animationsCode } from "./demos/Animations";
import InfiniteAnimation, { code as infiniteAnimationCode } from "./demos/InfiniteAnimation";
import Transitions, { code as transitionsCode } from "./demos/Transitions";
import CSSVariables, { code as cssVariablesCode } from "./demos/CSSVariables";
import VariablesProvider, {
  code as variablesProviderCode
} from "./demos/VariablesProvider";
import StyleOverrides, {
  code as styleOverridesCode
} from "./demos/StyleOverrides";
import CustomAnimations from "./demos/CustomAnimations";
import ColorFunction, {
  code as colorFunctionCode
} from "./demos/ColorFunction";
import CustomButton from "./demos/CustomButton";
import MediaQueries from "./demos/MediaQueries";

const App = cssta(ScrollView)`
  padding: 20px 0px;
  background: #ecf0f1;
`;

const DemoContainer = cssta(View)`
  margin: 10px 0px;
`;

const DemoTitle = cssta(Text)`
  padding: 5px 20px;
  color: #7f8c8d;
`;

const DemoBody = cssta(View)`
  padding: 20px;
  background-color: white;
  border-color: #bdc3c7;
  border-top-width: ${StyleSheet.hairlineWidth}px;

  &[@noCode] {
    border-bottom-width: ${StyleSheet.hairlineWidth}px;
  }
`;

const CodeContainer = cssta(View)`
  background-color: #7f8c8d;
  padding: 5px 20px;
`;

const CodeBody = cssta(Text)`
  font: 8px "courier";
  color: #ecf0f1;
`;

const Demo = ({ title, children, code }) => (
  <DemoContainer>
    <View>
      <DemoTitle>{title}</DemoTitle>
    </View>
    <DemoBody noCode={!code}>{children}</DemoBody>
    {code && (
      <CodeContainer>
        <CodeBody>{code}</CodeBody>
      </CodeContainer>
    )}
  </DemoContainer>
);

export default () => (
  <App>
    <Demo title="Basic" code={basicCode}>
      <Basic />
    </Demo>
    <Demo title="Animations" code={animationsCode}>
      <Animations />
    </Demo>
    <Demo title="Infinite Animation" code={infiniteAnimationCode}>
      <InfiniteAnimation />
    </Demo>
    <Demo title="Transitions" code={transitionsCode}>
      <Transitions />
    </Demo>
    <Demo title="CSS Variables" code={cssVariablesCode}>
      <CSSVariables />
    </Demo>
    <Demo title="Dynamically Injected Variables" code={variablesProviderCode}>
      <VariablesProvider />
    </Demo>
    <Demo title="Style Overrides" code={styleOverridesCode}>
      <StyleOverrides />
    </Demo>
    <Demo title="Custom Animations">
      <CustomAnimations />
    </Demo>
    <Demo title="Color Function" code={colorFunctionCode}>
      <ColorFunction />
    </Demo>
    <Demo title="Custom Button">
      <CustomButton />
    </Demo>
    <Demo title="Media Queries">
      <MediaQueries />
    </Demo>
  </App>
);
