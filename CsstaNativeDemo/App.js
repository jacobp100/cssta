import React, { Component } from 'react';
import { View, Text } from 'react-native';
import cssta from 'cssta/native';
import DynamicDemo from './components/DynamicDemo';

const HeadingContainer = cssta(View)`
  margin: 50 50 20;
  padding: 10;
  border-radius: 5;
  border: 1 solid red;
`;

const HeadingText = cssta(Text)`
  color: red;
`;

export default () => (
  <View>
    <HeadingContainer>
      <HeadingText>Hello World!</HeadingText>
    </HeadingContainer>
    <DynamicDemo />
  </View>
);
