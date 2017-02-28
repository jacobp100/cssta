import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _Transition from 'cssta/dist/native/dynamicComponentEnhancers/Transition';
import { StyleSheet as _StyleSheet } from 'react-native';

import { Animated } from 'react-native';

const _style = {
  'backgroundColor': '#e74c3c',
  'height': 20,
  'marginBottom': 20,
  'transform': [{
    'rotate': '0deg'
  }, {
    'scaleX': 1
  }]
},
      _style2 = {
  'backgroundColor': '#1abc9c',
  'transform': [{
    'rotate': '6deg'
  }, {
    'scaleX': 0.5
  }]
};

var _csstaStyle = _StyleSheet.create({
  0: _style,
  1: _style2
});

_dynamicComponent(Animated.View, ['active'], [_Transition], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {
      'backgroundColor': ['0.5s', 'linear'],
      'transform': ['0.75s', 'linear']
    },
    'exportedVariables': {},
    'style': _style,
    'styleSheetReference': _csstaStyle[0]
  }, {
    'validate': function (p) {
      return !!p['active'];
    },
    'transitions': {},
    'exportedVariables': {},
    'style': _style2,
    'styleSheetReference': _csstaStyle[1]
  }],
  'transitions': ['backgroundColor', 'transform'],
  'importedVariables': []
});