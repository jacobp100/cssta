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
};
