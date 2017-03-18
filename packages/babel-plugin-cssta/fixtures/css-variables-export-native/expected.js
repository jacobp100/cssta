import _withEnhancers from 'cssta/lib/native/withEnhancers';
import _VariablesStyleSheetManager from 'cssta/lib/native/enhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_withEnhancers([_VariablesStyleSheetManager])(View, ['blue'], {
  'transitionedProperties': [],
  'importedVariables': [],
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
    'styleTuples': []
  }, {
    'validate': function (p) {
      return !!p["blue"];
    },
    'exportedVariables': {
      'color': 'blue'
    },
    'transitionParts': {},
    'animationParts': null,
    'styleTuples': []
  }]
});