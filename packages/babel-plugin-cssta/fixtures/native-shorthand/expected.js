import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const _style = {
  'fontStyle': 'italic',
  'fontWeight': 'bold',
  'fontVariant': [],
  'fontSize': 12,
  'fontFamily': 'Helvetica',
  'lineHeight': 18
};

var _csstaStyle = _StyleSheet.create({
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