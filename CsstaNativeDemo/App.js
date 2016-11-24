import React from 'react';
import { View, Text } from 'react-native';
import cssta from 'cssta/native';

const HeadingContainer = cssta(View)`
  margin: 50;
  padding: 10;
  border-radius: 5;
  border: 1 solid red;
`

const HeadingText = cssta(Text)`
  color: red;
`

export default () => (
  <HeadingContainer>
    <HeadingText>Hello World!</HeadingText>
  </HeadingContainer>
);
