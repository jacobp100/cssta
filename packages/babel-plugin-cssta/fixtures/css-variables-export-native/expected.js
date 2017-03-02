import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _VariablesStyleSheetManager from 'cssta/lib/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_dynamicComponent(View, ['blue'], [_VariablesStyleSheetManager], {
  'transitionedProperties': [],
  'importedVariables': [],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {
      'color': 'red'
    },
    'animation': null,
    'styleTuples': []
  }, {
    'validate': function (p) {
      return !!p['blue'];
    },
    'transitions': {},
    'exportedVariables': {
      'color': 'blue'
    },
    'animation': null,
    'styleTuples': []
  }],
  'keyframesStyleTuples': {}
});