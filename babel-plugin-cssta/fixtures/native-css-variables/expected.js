import _csstaDistNativeDynamicComponent from 'cssta/dist/native/dynamicComponent';

import { View } from 'react-native';

_csstaDistNativeDynamicComponent(View, [], ['color'], [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['color', 'var(--color)']],
  'variables': {
    'color': 'red'
  }
}]);