"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  self._boolean = function (symbol) {
    declare(symbol, "boolean", registry.nextBoolean());
  };

  self._integer = function (symbol, width) {
    declare(symbol, "integer", registry.nextInteger(), width);
  };

  var declare = function (symbol, type, symbols, width) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      if (type === "boolean") {
        codeWriter.instruction({ type: type, symbol: symbols[0] });
      } else if (type === "integer") {
        codeWriter.instruction({ type: type, symbol: symbols[0], width: width });
      }

      symbolTable.set(symbol, type, symbols);
    }
  };
};

module.exports = InstructionSet;
