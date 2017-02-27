import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_dynamicComponent(View, ['blue'], [_VariablesStyleSheetManager], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {
      'color': 'red'
    },
    'styleTuples': [],
    'exportedVariables': {
      'color': 'red'
    }
  }, {
    'validate': function (p) {
      return !!p['blue'];
    },
    'exportedVariables': {
      'color': 'blue'
    },
    'styleTuples': [],
    'exportedVariables': {
      'color': 'blue'
    }
  }],
  'transitions': [],
  'importedVariables': []
});