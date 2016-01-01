"use strict";

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "push":
        self.push(instruction.symbol);
        break;
      case "pop":
        self.pop(instruction.symbol);
        break;
      case "not":
        self.not();
        break;
      case "and":
        self.and();
        break;
      case "or":
        self.or();
        break;
      case "equal":
        self.equal();
        break;
      case "true":
        self._true();
        break;
      case "false":
        self._false();
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      case "duplicate":
        self.duplicate();
        break;
      case "swap":
        self.swap();
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

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

  self.and = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(-leftLiteral, -rightLiteral, literal);
    codeWriter.clause(leftLiteral, -literal);
    codeWriter.clause(rightLiteral, -literal);
  };

  self.or = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(leftLiteral, rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, literal);
    codeWriter.clause(-rightLiteral, literal);
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightLiteral = symbolTable.get(rightSymbol);
    var leftLiteral = symbolTable.get(leftSymbol);

    var symbol = registry.nextSymbol();
    var literal = registry.nextLiteral();

    stack.push(symbol);
    symbolTable.set(symbol, literal);

    codeWriter.clause(leftLiteral, rightLiteral, literal);
    codeWriter.clause(leftLiteral, -rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, rightLiteral, -literal);
    codeWriter.clause(-leftLiteral, -rightLiteral, literal);
  };

  self._true = function () {
    var symbol = registry.trueSymbol();
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(literal);
    }
  };

  self._false = function () {
    var symbol = registry.falseSymbol();
    stack.push(symbol);

    if (!symbolTable.contains(symbol)) {
      var literal = registry.nextLiteral();

      symbolTable.set(symbol, literal);
      codeWriter.clause(-literal);
    }
  };

  self.variable = function (symbol) {
    var literal = symbolTable.get(symbol);
    codeWriter.variable(symbol, literal);
  };

  self.duplicate = function () {
    var symbol = stack.pop();

    stack.push(symbol);
    stack.push(symbol);
  };

  self.swap = function () {
    var topSymbol = stack.pop();
    var bottomSymbol = stack.pop();

    stack.push(topSymbol);
    stack.push(bottomSymbol);
  };
};

module.exports = InstructionSet;
