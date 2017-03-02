import _staticComponent from 'cssta/lib/native/staticComponent';
import { transformRawValue as _transformRawValue } from 'cssta/lib/packages/css-to-react-native';

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
  'animation': null,
  'style': _csstaStyle[0]
}]);