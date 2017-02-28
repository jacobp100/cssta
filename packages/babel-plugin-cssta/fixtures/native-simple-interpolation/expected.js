import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const color = 'red';

const _style = {
  'marginTop': 10,
  'color': String(color).trim()
},
      _style2 = {
  'color': String(color).trim(),
  'marginTop': 10
},
      _style3 = {
  'marginTop': 10,
  'color': String(color).trim(),
  'marginBottom': 10
};

var _csstaStyle = _StyleSheet.create({
  0: _style,
  1: _style2,
  2: _style3
});

_staticComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validate': function (p) {
    return !!p['attr1'];
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['attr2'];
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style2,
  'styleSheetReference': _csstaStyle[1]
}, {
  'validate': function (p) {
    return !!p['attr3'];
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style3,
  'styleSheetReference': _csstaStyle[2]
}]);