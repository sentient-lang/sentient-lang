"use strict";

var DynamicScope = function (contextTable, localTable, registry) {
  var self = this;
  self.reassignedArrays = [];

  self.set = function (symbol, type, symbols, forceLocal) {
    updateReassignedArrays(symbol, type, forceLocal);
    return target(symbol, forceLocal).set(symbol, type, symbols);
  };

  self.type = function (symbol) {
    return target(symbol).type(symbol);
  };

  self.symbols = function (symbol) {
    return target(symbol).symbols(symbol);
  };

  self.contains = function (symbol) {
    return target(symbol).contains(symbol);
  };

  self.setNilConditions = function (symbol, conditions) {
    return target(symbol).setNilConditions(symbol, conditions);
  };

  self.getNilConditions = function (symbol) {
    return target(symbol).getNilConditions(symbol);
  };

  var target = function (symbol, forceLocal) {
    if (forceLocal || localTable.contains(symbol)) {
      return localTable;
    } else if (contextTable.contains(symbol)) {
      return contextTable;
    } else {
      return localTable;
    }
  };

  var updateReassignedArrays = function (symbol, type, forceLocal) {
    var symbolTable = target(symbol, forceLocal);

    if (symbolTable !== contextTable) {
      return;
    }

    if (self.reassignedArrays.indexOf(symbol) !== -1) {
      return;
    }

    self.reassignedArrays.push(symbol);
  };
};

module.exports = DynamicScope;
