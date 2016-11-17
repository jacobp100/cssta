import _csstaCreateComponent from 'cssta/lib/native/createComponent';

import { View } from 'react-native';

const marginSmall = 10;
const marginLarge = 10;

import _cssToReactNative from 'css-to-react-native';
import { StyleSheet as _StyleSheet } from 'react-native';

var _csstaStyle = _StyleSheet.create({
  'style1': Object.assign({
    'paddingTop': 10
  }, _cssToReactNative([['margin', `${ marginLarge } ${ marginSmall }`]])),
  'style2': Object.assign(_cssToReactNative([['margin', `${ marginLarge } ${ marginSmall }`]]), {
    'paddingTop': 10
  }),
  'style3': Object.assign({
    'paddingTop': 10
  }, _cssToReactNative([['margin', `${ marginLarge } ${ marginSmall }`]]), {
    'paddingBottom': 10
  })
});

_csstaCreateComponent(View, ['attr1', 'attr2', 'attr3'], [{
  'validator': function (p) {
    return !!p['attr1'];
  },
  'style': _csstaStyle['style1']
}, {
  'validator': function (p) {
    return !!p['attr2'];
  },
  'style': _csstaStyle['style2']
}, {
  'validator': function (p) {
    return !!p['attr3'];
  },
  'style': _csstaStyle['style3']
}]);