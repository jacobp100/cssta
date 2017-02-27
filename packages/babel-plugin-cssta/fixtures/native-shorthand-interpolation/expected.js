import { StyleSheet as _StyleSheet } from 'react-native';
import _staticComponent from 'cssta/dist/native/staticComponent';
import _cssToReactNative from 'css-to-react-native';

import { View } from 'react-native';

const font = '10px "Helvetica"';

var _csstaStyle = _StyleSheet.create({
  0: Object.assign({
    'marginTop': 10
  }, _cssToReactNative([['font', `${ font }`]])),
  1: Object.assign(_cssToReactNative([['font', `${ font }`]]), {
    'marginTop': 10
  }),
  2: Object.assign({
    'marginTop': 10
  }, _cssToReactNative([['font', `${ font }`]]), {
    'marginBottom': 10
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