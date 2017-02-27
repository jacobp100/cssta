import React from 'react';
import { View } from 'react-native'; // eslint-disable-line
import { create as render } from 'react-test-renderer';
import styled, { resetStyleCache } from 'styled-components/native';
import cssta from 'cssta/native';


export default {
  'simple component': {
    styled: () => {
      resetStyleCache();

      const Component = styled(View)`
        color: red;
      `;

      render(<Component />);
    },
    cssta: () => {
      const Component = cssta(View)`
        color: red;
      `;

      render(<Component />);
    },
  },

  'prop changes': {
    styled: () => {
      resetStyleCache();

      const Component = styled(View)`
        color: ${props => (props.danger ? 'red' : 'black')};
      `;

      const instance = render(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
    },
    cssta: () => {
      const Component = cssta(View)`
        color: black;

        [danger] {
          color: red;
        }
      `;

      const instance = render(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
    },
  },

  'prop shorthands': {
    styled: () => {
      resetStyleCache();

      const Component = styled(View)`
        color: red;
        flex: 1;
        font: bold 12/14 "Helvetica";
        margin: 1 2;
        padding: 3 4;
        border: 1 solid black;
      `;

      render(<Component />);
    },
    cssta: () => {
      const Component = cssta(View)`
        color: red;
        flex: 1;
        font: bold 12px/14px "Helvetica";
        margin: 1px 2px;
        padding: 3px 4px;
        border: 1px solid black;
      `;

      render(<Component />);
    },
  },

  'prop shorthands with prop changes': {
    styled: () => {
      resetStyleCache();

      const Component = styled(View)`
        color: ${props => (props.danger ? 'red' : 'black')};
        flex: 1;
        font: bold 12/14 "Helvetica";
        margin: 1 2;
        padding: 3 4;
        border: 1 solid black;
      `;

      const instance = render(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
    },
    cssta: () => {
      const Component = cssta(View)`
        color: black;
        flex: 1;
        font: bold 12px/14px "Helvetica";
        margin: 1px 2px;
        padding: 3px 4px;
        border: 1px solid black;

        [danger] {
          color: red;
        }
      `;

      const instance = render(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
      instance.update(<Component />);
      instance.update(<Component danger />);
    },
  },
};
