import _StaticStyleSheetManager from 'cssta/dist/native/dynamicComponent/StaticStyleSheetManager';
import _combineManagers from 'cssta/dist/native/dynamicComponent/combineManagers';

import { View } from 'react-native';

_combineManagers(_StaticStyleSheetManager, [])(View, ['blue'], {
  'transitions': [],
  'importedVariables': []
}, [{
  'validate': function (p) {
    return true;
  },
  'styleTuples': [],
  'transitions': {},
  'exportedVariables': {
    'color': 'red'
  }
}, {
  'validate': function (p) {
    return !!p['blue'];
  },
  'styleTuples': [],
  'transitions': {},
  'exportedVariables': {
    'color': 'blue'
  }
}]);