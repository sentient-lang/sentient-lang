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

  self.push = function (symbol) {
    if (!symbolTable.contains(symbol)) {
      var message = "'" + symbol + "' must be declared before it can be used";
      throw new Error(message);
    }

    stack.push(symbol);
  };

  self.pop = function (symbol) {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    if (symbolTable.contains(symbol)) {
      var declaredType = symbolTable.type(symbol);

      if (stackType !== declaredType) {
        var message = "unable to assign " + stackType + " to ";
        message += declaredType + " '" + symbol + "'";
        throw new Error(message);
      }
    }

    symbolTable.set(symbol, stackType, stackSymbols);
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
