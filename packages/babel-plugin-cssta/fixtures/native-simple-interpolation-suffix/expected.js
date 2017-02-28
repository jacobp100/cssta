import _staticComponent from 'cssta/dist/native/staticComponent';
import { transformRawValue as _transformRawValue } from 'cssta/dist/packages/css-to-react-native';

import { View, StyleSheet } from 'react-native';

const _style = {
  'borderBottomWidth': _transformRawValue(`${StyleSheet.hairlineWidth}px`)
};

var _csstaStyle = StyleSheet.create({
  0: _style
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}]);