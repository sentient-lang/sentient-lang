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
    declare(symbol, "integer", registry.nextInteger(width));
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

  self.constant = function (value) {
    var symbol, type, symbols;
    symbol = registry.nextSymbol();

    if (typeof value === "boolean") {
      type = "boolean";
      symbols = registry.nextBoolean();
      codeWriter.instruction({ type: value.toString() });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    }

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);
  };

  var declare = function (symbol, type, symbols) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      _.each(symbols, function (s) {
        codeWriter.instruction({ type: "push", symbol: s });
      });

      var clone = symbols.slice(0);
      clone.reverse();

      _.each(clone, function (s) {
        codeWriter.instruction({ type: "pop", symbol: s });
      });

      symbolTable.set(symbol, type, symbols);
    }
  };
};

module.exports = InstructionSet;
