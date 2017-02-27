import _VariablesStyleSheetManager from 'cssta/dist/native/dynamicComponent/VariablesStyleSheetManager';
import _combineManagers from 'cssta/dist/native/dynamicComponent/combineManagers';

import { View } from 'react-native';

_combineManagers(_VariablesStyleSheetManager, [])(View, [], {
  'transitions': [],
  'importedVariables': ['color']
}, [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [['color', 'var(--color)']],
  'transitions': {},
  'exportedVariables': {
    'color': 'red'
  }
}]);