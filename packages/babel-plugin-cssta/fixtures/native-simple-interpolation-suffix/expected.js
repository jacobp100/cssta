import _createComponent from 'cssta/lib/native/createComponent';
import { transformRawValue as _transformRawValue } from 'cssta/lib/native/cssUtil';

import { View, StyleSheet } from 'react-native';

var _csstaStyle = StyleSheet.create({
  0: {
    'borderBottomWidth': _transformRawValue(`${StyleSheet.hairlineWidth}px`)
  }
});

_createComponent(View, [], {
  'importedVariables': [],
  'transitionedProperties': [],
  'keyframes': {},
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'style': _csstaStyle[0]
  }]
});