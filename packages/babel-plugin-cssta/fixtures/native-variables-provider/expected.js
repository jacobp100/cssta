import _staticComponent from 'cssta/dist/native/staticComponent';
import { StyleSheet as _StyleSheet } from 'react-native';
import VariablesProvider from 'cssta/dist/native/VariablesProvider';

import { View } from 'react-native';

const _style = {
  'color': 'red'
};

var _csstaStyle = _StyleSheet.create({
  0: _style
});

_staticComponent(View, [], [{
  'validate': function (p) {
    return true;
  },
  'transitions': {},
  'exportedVariables': {},
  'style': _style,
  'styleSheetReference': _csstaStyle[0]
}]);

VariablesProvider;