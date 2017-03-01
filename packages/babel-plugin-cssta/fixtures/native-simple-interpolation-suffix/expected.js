import _staticComponent from 'cssta/dist/native/staticComponent';
import { transformRawValue as _transformRawValue } from 'cssta/dist/packages/css-to-react-native';

import { View, StyleSheet } from 'react-native';

var _csstaStyle = StyleSheet.create({
  0: {
    'borderBottomWidth': _transformRawValue(`${StyleSheet.hairlineWidth}px`)
  }
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _csstaStyle[0]
}]);