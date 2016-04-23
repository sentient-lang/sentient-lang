"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};
  var nils = {};

  self.set = function (symbol, type, symbols) {
    object[symbol] = { type: type, symbols: symbols };
  };

  self.type = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].type;
  };

  self.symbols = function (symbol) {
    throwIfMissing(symbol);
    return object[symbol].symbols;
  };

  self.contains = function (symbol) {
    return typeof object[symbol] !== "undefined";
  };

  self.setNilConditions = function (symbol, conditions) {
    throwIfMissing(symbol);

    if (typeof conditions === "undefined") {
      throw new Error("No conditions specified for " + symbol);
    }

    if (self.type(symbol) !== "array") {
      throw new Error("Cannot set nil conditions for non-array " + symbol);
    }

    nils[symbol] = conditions;
  };

  self.getNilConditions = function (symbol) {
    throwIfMissing(symbol);
    return nils[symbol];
  };

  var throwIfMissing = function (symbol) {
    if (!self.contains(symbol)) {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }
  };
};

module.exports = SymbolTable;
