import _createComponent from 'cssta/lib/native/createComponent';
import { transformRawValue as _transformRawValue } from 'cssta/lib/packages/css-to-react-native';

import { View, StyleSheet } from 'react-native';

var _csstaStyle = StyleSheet.create({
  0: {
    'borderBottomWidth': _transformRawValue(`${StyleSheet.hairlineWidth}px`)
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'style': _csstaStyle[0]
  }],
  'keyframes': {}
});