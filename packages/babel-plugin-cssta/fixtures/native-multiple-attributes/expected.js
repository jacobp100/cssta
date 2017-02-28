import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const _style = {
  'color': 'red'
},
      _style2 = {
  'color': 'green'
},
      _style3 = {
  'color': 'blue'
},
      _style4 = {
  'color': 'yellow'
};

var _csstaStyle = _StyleSheet.create({
  0: _style,
  1: _style2,
  2: _style3,
  3: _style4
});

_staticComponent(View, ['booleanAttribute', 'stringAttribute'], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['booleanAttribute'];
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style2,
  'styleSheetReference': _csstaStyle[1]
}, {
  'validate': function (p) {
    return p['stringAttribute'] === '1';
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style3,
  'styleSheetReference': _csstaStyle[2]
}, {
  'validate': function (p) {
    return p['stringAttribute'] === '2';
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style4,
  'styleSheetReference': _csstaStyle[3]
}]);