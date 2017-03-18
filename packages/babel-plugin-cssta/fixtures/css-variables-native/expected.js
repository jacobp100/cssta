import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager])(View, [], {
  'transitionedProperties': [],
  'importedVariables': ['color'],
  'keyframesStyleTuples': {},
  'ruleTuples': [{
    'validate': function (p) {
      return true;
    },
    'exportedVariables': {
      'color': 'red'
    },
    'transitionParts': {},
    'animationParts': null,
    'styleTuples': [['color', 'var(--color)']]
  }]
});