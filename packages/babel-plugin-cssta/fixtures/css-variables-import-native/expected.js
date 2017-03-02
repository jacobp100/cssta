import _dynamicComponent from 'cssta/lib/native/dynamicComponent';
import _VariablesStyleSheetManager from 'cssta/lib/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_dynamicComponent(View, [], [_VariablesStyleSheetManager], {
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