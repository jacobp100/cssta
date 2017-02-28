import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const color = 'blue';

_staticComponent(View, [], []);

const _style = {
  'color': 'red'
};

var _csstaStyle2 = _StyleSheet.create({
  0: _style
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle2[0]
}]);