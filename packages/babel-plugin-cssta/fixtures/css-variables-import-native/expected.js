import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager])(View, [], {
  'importedVariables': ['color'],
  'transitionedProperties': [],
  'keyframesStyleTuples': {},
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--color)']]
  }]
});