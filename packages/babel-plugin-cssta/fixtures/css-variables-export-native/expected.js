import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager])(View, ['blue'], {
  'importedVariables': [],
  'transitionedProperties': [],
  'keyframesStyleTuples': {},
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {
      'color': 'red'
    },
    'styleTuples': []
  }, {
    'validate': function (p) {
      return !!p['blue'];
    },
    'exportedVariables': {
      'color': 'blue'
    },
    'styleTuples': []
  }]
});