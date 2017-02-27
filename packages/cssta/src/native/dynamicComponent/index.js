const combineManagers = require('./combineManagers');
const VariablesStyleSheetManager = require('./VariablesStyleSheetManager');
const TransitionTransform = require('./TransitionTransform');

module.exports = combineManagers(VariablesStyleSheetManager, [TransitionTransform]);
