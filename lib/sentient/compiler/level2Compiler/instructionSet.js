"use strict";

var TwosComplement = require("./twosComplement");
var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "boolean":
        self._boolean(instruction.symbol);
        break;
      case "integer":
        self._integer(instruction.symbol, instruction.width);
        break;
      case "push":
        self.push(instruction.symbol);
        break;
      case "pop":
        self.pop(instruction.symbol);
        break;
      case "constant":
        self.constant(instruction.value);
        break;
      case "equal":
        self.equal();
        break;
      case "add":
        self.add();
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

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
    var symbol = registry.nextSymbol();
    var type = typeName(value);
    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
      codeWriter.instruction({ type: value.toString() });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else if (type === "integer") {
      var bitArray = TwosComplement.encode(value);
      symbols = registry.nextInteger(bitArray.length);

      _.each(bitArray, function (bit, index) {
        codeWriter.instruction({ type: bit.toString() });
        codeWriter.instruction({ type: "pop", symbol: symbols[index] });
      });
    }

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (rightType === "boolean" && leftType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "equal" });
    } else if (rightType === "integer" && leftType === "integer") {
      var padded = pad(leftSymbols, rightSymbols);

      _.each(padded.rightSymbols, function (r, index) {
        var l = padded.leftSymbols[index];

        codeWriter.instruction({ type: "push", symbol: l });
        codeWriter.instruction({ type: "push", symbol: r });
        codeWriter.instruction({ type: "equal" });
      });

      for (var i = 0; i < padded.rightSymbols.length - 1; i += 1) {
        codeWriter.instruction({ type: "and" });
      }
    } else {
      var msg = "Type mismatch for equals: " + leftType + " == " + rightType;
      throw new Error(msg);
    }

    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.add = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== "integer" || leftType !== "integer") {
      throw new Error("Cannot add a " + rightType + " to a " + leftType);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var padded = pad(leftSymbols, rightSymbols);
    var width = padded.leftSymbols.length + 1;

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger(width);

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    var carryIn = registry.nextBoolean();
    codeWriter.instruction({ type: "false" });
    codeWriter.instruction({ type: "pop", symbol: carryIn[0] });

    for (var i = width - 2; i >= 0; i -= 1) {
      var r = padded.rightSymbols[i];
      var l = padded.leftSymbols[i];

      // l xor r
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });

      // sum = (l xor r) xor c_in
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i + 1] });

      // l xor r
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });

      // (l xor r) and c_in
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "and" });

      // a and b
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "and" });

      // carry = (a and b) or ((l xor r) and c_in)
      carryIn = registry.nextBoolean();
      codeWriter.instruction({ type: "or" });
      codeWriter.instruction({ type: "pop", symbol: carryIn[0] });
    }

    // a == b
    codeWriter.instruction({ type: "push", symbol: padded.leftSymbols[0] });
    codeWriter.instruction({ type: "push", symbol: padded.rightSymbols[0] });
    codeWriter.instruction({ type: "equal" });

    // (a == b) && c_in
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "and" });

    // a == !b
    codeWriter.instruction({ type: "push", symbol: padded.leftSymbols[0] });
    codeWriter.instruction({ type: "push", symbol: padded.rightSymbols[0] });
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "equal" });

    // (a == !b) && !c_in
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "and" });

    // sum = ((a == b) && c_in) || ((a == !b) && !c_in)
    codeWriter.instruction({ type: "or" });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.variable = function (symbol) {
    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    _.each(symbols, function (s) {
      codeWriter.instruction({ type: "variable", symbol: s });
    });

    codeWriter.variable(symbol, type, symbols);
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

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else {
      throw new Error("Constants of type '" + t + "' are not supported");
    }
  };

  var pad = function (leftSymbols, rightSymbols) {
    var left = leftSymbols.slice(0);
    var right = rightSymbols.slice(0);

    for (var i = 0; i < leftSymbols.length - rightSymbols.length; i += 1) {
      right.unshift(right[0]);
    }

    for (var i = 0; i < rightSymbols.length - leftSymbols.length; i += 1) {
      left.unshift(left[0]);
    }

    return { leftSymbols: left, rightSymbols: right };
  };
};

module.exports = InstructionSet;
