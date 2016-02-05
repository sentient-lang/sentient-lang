"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};

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

  var throwIfMissing = function (symbol) {
    if (!self.contains(symbol)) {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }
  };
};

module.exports = SymbolTable;
