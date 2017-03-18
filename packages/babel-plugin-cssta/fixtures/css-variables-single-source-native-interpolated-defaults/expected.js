import _createComponent from 'cssta/lib/native/createComponent';
import { StyleSheet as _StyleSheet } from 'react-native';

import { View } from 'react-native';

const color = 'blue';

View;

var _csstaStyle = _StyleSheet.create({
  0: {
    'color': 'red'
  }
});

_createComponent(View, [], {
  'transitionedProperties': [],
  'keyframes': {},
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'style': _csstaStyle[0]
  }]
});