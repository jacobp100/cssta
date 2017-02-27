import { StyleSheet as _StyleSheet } from 'react-native';
import _staticComponent from 'cssta/dist/native/staticComponent';
import _cssToReactNative from 'cssta/dist/packages/css-to-react-native';

import { View } from 'react-native';

const marginSmall = 10;
const marginLarge = 10;

var _csstaStyle = _StyleSheet.create({
  0: Object.assign({
    'paddingTop': 10
  }, _cssToReactNative([['margin', `${marginLarge} ${marginSmall}`]])),
  1: Object.assign(_cssToReactNative([['margin', `${marginLarge} ${marginSmall}`]]), {
    'paddingTop': 10
  }),
  2: Object.assign({
    'paddingTop': 10
  }, _cssToReactNative([['margin', `${marginLarge} ${marginSmall}`]]), {
    'paddingBottom': 10
  })
});

_staticComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validate': function (p) {
    return !!p['attr1'];
  },
  'style': _csstaStyle[0]
}, {
  'validate': function (p) {
    return !!p['attr2'];
  },
  'style': _csstaStyle[1]
}, {
  'validate': function (p) {
    return !!p['attr3'];
  },
  'style': _csstaStyle[2]
}]);