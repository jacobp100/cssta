import _dynamicComponent from 'cssta/dist/native/dynamicComponent';

import { View } from 'react-native';

_dynamicComponent(View, [], ['color'], [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['color', 'var(--color)']],
  'exportedVariables': {
    'color': 'red'
  }
}]);