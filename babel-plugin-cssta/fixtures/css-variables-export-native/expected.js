import _dynamicComponent from 'cssta/dist/native/dynamicComponent';

import { View } from 'react-native';

_dynamicComponent(View, ['blue'], [], [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [],
  'exportedVariables': {
    'color': 'red'
  }
}, {
  'validate': function (p) {
    return !!p['blue'];
  },
  'styleTuples': [],
  'exportedVariables': {
    'color': 'blue'
  }
}]);