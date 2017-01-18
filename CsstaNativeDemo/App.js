import React, { Component } from 'react';
import { View, Text, ScrollView, PixelRatio } from 'react-native';
import cssta from 'cssta/native';
import Basic from './demos/Basic';
import CSSVariables from './demos/CSSVariables';
import VariablesProvider from './demos/VariablesProvider';

const App = cssta(ScrollView)`
  padding: 20 0;
  background: #ecf0f1;
`;

const DemoContainer = cssta(View)`
  margin: 10 0;
`;

const DemoTitle = cssta(Text)`
  padding: 5 20;
  color: #7f8c8d;
`;

const DemoBody = cssta(View)`
  padding: 20;
  background-color: white;
  border-color: #bdc3c7;
  border-width: ${1 / PixelRatio.get()} 0;
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
    <Demo title="CSS Variables">
      <CSSVariables />
    </Demo>
    <Demo title="Injected Variables">
      <VariablesProvider />
    </Demo>
  </App>
);
