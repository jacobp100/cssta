import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const _style = {
  'width': 100
};

var _csstaStyle = _StyleSheet.create({
  0: _style
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {
    'large': '100',
    'small': '50',
    'margin': '100 50'
  },
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}]);

const _style2 = {
  'width': 50
};

var _csstaStyle2 = _StyleSheet.create({
  0: _style2
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style2,
  'styleSheetReference': _csstaStyle2[0]
}]);