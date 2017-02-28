import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_dynamicComponent(View, ['blue'], [_VariablesStyleSheetManager], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {
      'color': 'red'
    },
    'styleTuples': []
  }, {
    'validate': function (p) {
      return !!p['blue'];
    },
    'transitions': {},
    'exportedVariables': {
      'color': 'blue'
    },
    'styleTuples': []
  }],
  'transitions': [],
  'importedVariables': []
});