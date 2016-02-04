"use strict";

var SymbolTable = function () {
  var self = this;
  var object = {};

  self.set = function (symbol, type, symbols) {
    throwIfWrongStructure(type, symbols);
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

  var throwIfWrongStructure = function (type, symbols) {
    var symbolsType = typeof(symbols);

    if (type === "boolean" || type === "integer" || type === "array") {
      validateArray(symbols);
    } else if (type === "hash") {
      validateObject(symbols);
    } else {
      throw new Error("Unrecognised type: '" + type + "'");
    }
  };

  var validateArray = function (object) {
    if (!isArray(object)) {
      throw new Error("Expected an array type for symbols");
    }
  };

  var validateObject = function (object) {
    if (isArray(object)) {
      throw new Error("Expected an object type for symbols");
    }
  };

  var isArray = function (object) {
    return object.constructor === Array;
  };
};

module.exports = SymbolTable;
