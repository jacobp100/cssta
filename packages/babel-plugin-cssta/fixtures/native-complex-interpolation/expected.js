import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';
import _cssToReactNative from 'cssta/dist/packages/css-to-react-native';

import { View } from 'react-native';

const marginSmall = 10;
const marginLarge = 10;

const _style = Object.assign({
  'paddingTop': 10
}, _cssToReactNative([['margin', `${marginLarge}px ${marginSmall}px`]]));

const _style2 = Object.assign(_cssToReactNative([['margin', `${marginLarge}px ${marginSmall}px`]]), {
  'paddingTop': 10
});

const _style3 = Object.assign({
  'paddingTop': 10
}, _cssToReactNative([['margin', `${marginLarge}px ${marginSmall}px`]]), {
  'paddingBottom': 10
});

var _csstaStyle = _StyleSheet.create({
  0: _style,
  1: _style2,
  2: _style3
});

_staticComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validate': function (p) {
    return !!p['attr1'];
  },
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['attr2'];
  },
  'exportedVariables': {},
  'style': _style2,
  'styleSheetReference': _csstaStyle[1]
}, {
  'validate': function (p) {
    return !!p['attr3'];
  },
  'exportedVariables': {},
  'style': _style3,
  'styleSheetReference': _csstaStyle[2]
}]);