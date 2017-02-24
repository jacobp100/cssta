import React, { Component } from 'react';
import { View, Text, ScrollView, PixelRatio } from 'react-native';
import cssta from 'cssta/native';
import Basic from './demos/Basic';
import Transitions from './demos/Transitions';
import CSSVariables from './demos/CSSVariables';
import VariablesProvider from './demos/VariablesProvider';
import StyleOverrides from './demos/StyleOverrides';
import Animations from './demos/Animations';
import ColorFunction from './demos/ColorFunction';

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
  border-width: ${1 / PixelRatio.get()}px 0px;
`;

const Demo = ({ title, children }) => (
  <DemoContainer>
    <View>
      <DemoTitle>{title}</DemoTitle>
    </View>
    <DemoBody>
      {children}
    </DemoBody>
  </DemoContainer>
);

export default () => (
  <App>
    <Demo title="Basic">
      <Basic />
    </Demo>
    <Demo title="Transitions">
      <Transitions />
    </Demo>
    <Demo title="CSS Variables">
      <CSSVariables />
    </Demo>
    <Demo title="Dynamically Injected Variables">
      <VariablesProvider />
    </Demo>
    <Demo title="Style Overrides">
      <StyleOverrides />
    </Demo>
    <Demo title="Animations">
      <Animations />
    </Demo>
    <Demo title="Color Function">
      <ColorFunction />
    </Demo>
  </App>
);
