"use strict";

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;

  self.boolean = function (symbol) {
    declare(symbol, "boolean", registry.nextBoolean());
  };

  self.integer = function (symbol, width) {
    declare(symbol, "integer", registry.nextInteger(width));
  }

  var declare = function (symbol, type, symbols) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      symbolTable.set(symbol, type, symbols);
    }
  };
};

module.exports = InstructionSet;
