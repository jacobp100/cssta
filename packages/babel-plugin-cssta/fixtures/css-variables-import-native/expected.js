import _dynamicComponent from 'cssta/dist/native/dynamicComponent';
import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponentEnhancers/VariablesStyleSheetManager';

import { View } from 'react-native';

_dynamicComponent(View, [], [_VariablesStyleSheetManager], {
  'rules': [{
    'validate': function (p) {
      return true;
    },
    'transitions': {},
    'exportedVariables': {},
    'styleTuples': [['color', 'var(--color)']]
  }],
  'transitions': [],
  'importedVariables': ['color']
});