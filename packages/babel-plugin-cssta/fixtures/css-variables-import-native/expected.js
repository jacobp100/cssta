import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager])(View, [], {
  'transitionedProperties': [],
  'importedVariables': ['color'],
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'animation': null,
    'styleTuples': [['color', 'var(--color)']]
  }],
  'keyframesStyleTuples': {}
});