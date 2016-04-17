"use strict";

var DynamicScope = function (contextTable, localTable, registry) {
  var self = this;

  self.set = function (symbol, type, symbols, forceLocal) {
    copyElements(symbol, type, symbols, forceLocal);
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

  var target = function (symbol, forceLocal) {
    if (forceLocal || localTable.contains(symbol)) {
      return localTable;
    } else if (contextTable.contains(symbol)) {
      return contextTable;
    } else {
      return localTable;
    }
  };

  var copyElements = function (symbol, type, symbols, forceLocal) {
    if (type !== "array") {
      return;
    }

    if (forceLocal) {
      return;
    }

    if (!contextTable.contains(symbol) || localTable.contains(symbol)) {
      return;
    }

    recursivelyCopyElements(symbol, symbols);
  };

  var recursivelyCopyElements = function (symbol, elementSymbols) {
    for (var i = 0; i < elementSymbols.length; i += 1) {
      var elementSymbol = elementSymbols[i];
      var newSymbol = registry.nextSymbol();

      var type = self.type(symbol);
      var symbols = self.symbols(symbol);

      contextTable.set(newSymbol, type, symbols);
    }
  };
};

module.exports = DynamicScope;
