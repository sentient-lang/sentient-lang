"use strict";

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  self.push = function (symbol) {
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(literal, -literal);
    }
  };

  self.pop = function (symbol) {
    var stackSymbol = stack.pop();
    var stackLiteral = symbolTable.get(stackSymbol);

    symbolTable.set(symbol, stackLiteral);
  };

  self.not = function () {
    var stackSymbol = stack.pop();
    var stackLiteral = symbolTable.get(stackSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(stackLiteral, literal);
    codeWriter.clause(-stackLiteral, -literal);
  };
};

module.exports = InstructionSet;
