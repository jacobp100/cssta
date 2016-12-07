import { StyleSheet as _StyleSheet } from 'react-native';
import _csstaDistNativeStaticComponent from 'cssta/dist/native/staticComponent';
import _cssToReactNative from 'css-to-react-native';

import { View } from 'react-native';

const font = '10 "Helvetica"';

var _csstaStyle = _StyleSheet.create({
  'style1': Object.assign({
    'marginTop': 10
  }, _cssToReactNative([['font', `${ font }`]])),
  'style2': Object.assign(_cssToReactNative([['font', `${ font }`]]), {
    'marginTop': 10
  }),
  'style3': Object.assign({
    'marginTop': 10
  }, _cssToReactNative([['font', `${ font }`]]), {
    'marginBottom': 10
  })
});

_csstaDistNativeStaticComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validate': function (p) {
    return !!p['attr1'];
  },
  'style': _csstaStyle['style1']
}, {
  'validate': function (p) {
    return !!p['attr2'];
  },
  'style': _csstaStyle['style2']
}, {
  'validate': function (p) {
    return !!p['attr3'];
  },
  'style': _csstaStyle['style3']
}]);