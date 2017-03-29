import { StyleSheet as _StyleSheet } from 'react-native';
import _createComponent from 'cssta/lib/native/createComponent';

import { View } from 'react-native';

function test() {
  var _csstaStyle = _StyleSheet.create({
    0: {
      'color': 'red'
    }
  });

  const Component = _createComponent(View, [], {
    'transitionedProperties': [],
    'keyframes': {},
    'rules': [{
      'validate': function (p) {
        return true;
      },
      'transitions': {},
      'animation': null,
      'style': _csstaStyle[0]
    }]
  });
}