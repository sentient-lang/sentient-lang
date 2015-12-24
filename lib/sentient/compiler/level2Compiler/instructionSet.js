"use strict";

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;

  self.boolean = function (symbol) {
    if (symbolTable.contains(symbol)) {
      throw new Error("boolean '" + symbol + "' has already been declared");
    } else {
      var symbols = registry.nextBoolean();
      symbolTable.set(symbol, "boolean", symbols);
    }
  };
};

module.exports = InstructionSet;
