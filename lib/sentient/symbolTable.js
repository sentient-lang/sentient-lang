"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};

  self.set = function (symbol, literal) {
    object[symbol] = literal;
  };

  self.get = function (symbol) {
    var literal = object[symbol];

    if (typeof literal === "undefined") {
      throw new Error("Symbol '" + symbol + "' is not in the SymbolTable");
    }

    return literal;
  };

  self.contains = function (symbol) {
    var literal = object[symbol];
    return typeof literal !== "undefined";
  };
};

module.exports = SymbolTable;
