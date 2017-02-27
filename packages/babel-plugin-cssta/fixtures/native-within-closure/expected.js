import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

function test() {
  const _style = {
    'color': 'red'
  };

  var _csstaStyle = _StyleSheet.create({
    0: _style
  });

  const Component = _staticComponent(View, [], [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'style': _style,
    'styleSheetReference': _csstaStyle[0]
  }]);
}