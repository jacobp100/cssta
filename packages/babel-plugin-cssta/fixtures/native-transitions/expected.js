import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _Transition from 'cssta/dist/native/dynamicComponentEnhancers/Transition';
import { StyleSheet as _StyleSheet } from 'react-native';

import { Animated } from 'react-native';

const _style = {
  'color': 'red'
},
      _style2 = {
  'color': 'blue'
};

var _csstaStyle = _StyleSheet.create({
  0: _style,
  1: _style2
});

_dynamicComponent(Animated.View, ['boolAttr'], [_Transition], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'color': ['1s', 'linear']
    },
    'exportedVariables': {},
    'style': _style,
    'styleSheetReference': _csstaStyle[0]
  }, {
    'validate': function (p) {
      return !!p['boolAttr'];
    },
    'transitions': {},
    'exportedVariables': {},
    'style': _style2,
    'styleSheetReference': _csstaStyle[1]
  }],
  'transitions': ['color'],
  'importedVariables': []
});