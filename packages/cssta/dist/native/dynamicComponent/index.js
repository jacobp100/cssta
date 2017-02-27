'use strict';

var combineManagers = require('./combineManagers');
var VariablesStyleSheetManager = require('./VariablesStyleSheetManager');
var TransitionTransform = require('./TransitionTransform');

module.exports = combineManagers(VariablesStyleSheetManager, [TransitionTransform]);