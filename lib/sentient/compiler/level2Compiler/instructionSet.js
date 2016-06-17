"use strict";

var TwosComplement = require("./twosComplement");
var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;

  self.call = function (instruction) {
    try {
      call(instruction);
    } catch (error) {
      if (typeof error.originatingLevel === "undefined") {
        error.originatingLevel = 2;
      }

      error.level2Instruction = instruction;

      throw error;
    }
  };

  /*jshint maxcomplexity:false */
  var call = function (instruction) {
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
      case "and":
        self.and();
        break;
      case "or":
        self.or();
        break;
      case "not":
        self.not();
        break;
      case "equal":
        self.equal();
        break;
      case "add":
        self.add();
        break;
      case "negate":
        self.negate();
        break;
      case "absolute":
        self.absolute();
        break;
      case "subtract":
        self.subtract();
        break;
      case "lessthan":
        self.lessthan();
        break;
      case "greaterthan":
        self.greaterthan();
        break;
      case "lessequal":
        self.lessequal();
        break;
      case "greaterequal":
        self.greaterequal();
        break;
      case "multiply":
        self.multiply();
        break;
      case "divmod":
        self.divmod();
        break;
      case "divide":
        self.divide();
        break;
      case "modulo":
        self.modulo();
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
      case "if":
        self._if();
        break;
      case "invariant":
        self.invariant();
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
    if (!width) {
      throw new Error("No width provided when declaring integer");
    }

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

  self.and = function () {
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
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for and: " + leftType + " && " + rightType;
      throw new Error(msg);
    }
  };

  self.or = function () {
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
      codeWriter.instruction({ type: "or" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for or: " + leftType + " || " + rightType;
      throw new Error(msg);
    }
  };

  self.not = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    stack.push(symbol);
    symbolTable.set(symbol, "boolean", symbols);

    if (stackType === "boolean") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for not: " + stackType);
    }
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
      var padded = TwosComplement.pad(leftSymbols, rightSymbols);

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

    var padded = TwosComplement.pad(leftSymbols, rightSymbols);
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

      codeWriter.instruction({ type: "duplicate" });

      // sum = (l xor r) xor c_in
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "equal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i + 1] });

      // c_in = (l and r) or (c_in and (l xor r))
      codeWriter.instruction({ type: "push", symbol: carryIn[0] });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "push", symbol: l });
      codeWriter.instruction({ type: "push", symbol: r });
      codeWriter.instruction({ type: "and" });
      codeWriter.instruction({ type: "or" });

      carryIn = registry.nextBoolean();
      codeWriter.instruction({ type: "pop", symbol: carryIn[0] });
    }

    // l == r
    codeWriter.instruction({ type: "push", symbol: padded.leftSymbols[0] });
    codeWriter.instruction({ type: "push", symbol: padded.rightSymbols[0] });
    codeWriter.instruction({ type: "equal" });

    codeWriter.instruction({ type: "duplicate" });

    // (l == r) && c_in
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "and" });

    codeWriter.instruction({ type: "swap" });

    // (l != r) && !c_in
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "push", symbol: carryIn[0] });
    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "and" });

    // sign = ((l == r) and c_in) or (l != r) and !c_in)
    codeWriter.instruction({ type: "or" });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.negate = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger(stackSymbols.length);

    symbolTable.set(symbol, "integer", symbols);

    if (stackType !== "integer") {
      throw new Error("Wrong type for negate: " + stackType);
    }

    for (var i = 0; i < stackSymbols.length; i += 1) {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[i] });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i] });
    }

    self.push(symbol);
    self.constant(1);
    self.add();
  };

  self.absolute = function () {
    self.duplicate();
    self.constant(0);
    self.greaterequal();
    self.swap();
    self.duplicate();
    self.negate();
    self._if();
  };

  self.subtract = function () {
    self.negate();
    self.add();
  };

  self.lessthan = function () {
    self.subtract();

    var stackSymbol = stack.pop();
    var stackSymbols = symbolTable.symbols(stackSymbol);
    var signSymbol = stackSymbols[0];

    var symbol = registry.nextSymbol();
    stack.push(symbol);
    symbolTable.set(symbol, "boolean", [signSymbol]);
  };

  self.greaterthan = function () {
    self.swap();
    self.lessthan();
  };

  self.lessequal = function () {
    self.greaterthan();
    self.not();
  };

  self.greaterequal = function () {
    self.lessthan();
    self.not();
  };

  self.multiply = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== "integer" || leftType !== "integer") {
      throw new Error("Cannot multiply a " + rightType + " by a " + leftType);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var width = rightSymbols.length + leftSymbols.length;
    var padded = TwosComplement.pad(leftSymbols, rightSymbols, width);

    rightSymbols = padded.rightSymbols;
    leftSymbols = padded.leftSymbols;

    var zero = registry.nextBoolean()[0];
    codeWriter.instruction({ type: "false" });
    codeWriter.instruction({ type: "pop", symbol: zero });

    for (var r = width - 1; r >= 0; r -= 1) {
      var partialSymbol = registry.nextSymbol();
      var partialSymbols = registry.nextInteger(width);

      for (var l = width - r - 1; l < width; l += 1) {
        var index = l + r + 1 - width;

        codeWriter.instruction({ type: "push", symbol: rightSymbols[r] });
        codeWriter.instruction({ type: "push", symbol: leftSymbols[l] });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: partialSymbols[index] });
      }

      for (var i = r + 1; i < width; i += 1) {
        partialSymbols[i] = zero;
      }

      symbolTable.set(partialSymbol, "integer", partialSymbols);
      stack.push(partialSymbol);

      if (r < width - 1) {
        self.add();

        var sumSymbol = stack.pop();
        var sumSymbols = symbolTable.symbols(sumSymbol);

        var tailSymbol = registry.nextSymbol();
        var tailSymbols = sumSymbols.slice(1);

        symbolTable.set(tailSymbol, "integer", tailSymbols);
        stack.push(tailSymbol);
      }
    }
  };

  self.divmod = function () {
    var divisorSymbol = stack.pop();
    var dividendSymbol = stack.pop();

    var divisorType = symbolTable.type(divisorSymbol);
    var dividendType = symbolTable.type(dividendSymbol);

    if (divisorType !== "integer" || dividendType !== "integer") {
      var msg = "Cannot divide a " + dividendType + " by a " + divisorType;
      throw new Error(msg);
    }

    var width = symbolTable.symbols(dividendSymbol).length;

    var quotientSymbol = registry.nextSymbol();
    var remainderSymbol = registry.nextSymbol();

    var quotientSymbols = registry.nextInteger(width);
    var remainderSymbols = registry.nextInteger(width);

    symbolTable.set(quotientSymbol, "integer", quotientSymbols);
    symbolTable.set(remainderSymbol, "integer", remainderSymbols);

    // dividend = divisor * quotient + remainder
    self.push(divisorSymbol);
    self.push(quotientSymbol);
    self.multiply();
    self.push(remainderSymbol);
    self.add();
    self.push(dividendSymbol);
    self.equal();
    self.invariant();

    // remainder >= 0
    self.push(remainderSymbol);
    self.constant(0);
    self.greaterequal();
    self.invariant();

    // remainder < |divisor|
    self.push(remainderSymbol);
    self.push(divisorSymbol);
    self.absolute();
    self.lessthan();
    self.invariant();

    self.push(remainderSymbol);
    self.push(quotientSymbol);
  };

  self.divide = function () {
    self.divmod();
    self.swap();
    stack.pop();
  };

  self.modulo = function () {
    self.divmod();
    stack.pop();
  };

  self.variable = function (symbol) {
    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    _.each(symbols, function (s) {
      codeWriter.instruction({ type: "variable", symbol: s });
    });

    codeWriter.variable(symbol, type, symbols);
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

  self._if = function () {
    var alternateSymbol = stack.pop();
    var consequentSymbol = stack.pop();
    var conditionSymbol = stack.pop();

    var alternateType = symbolTable.type(alternateSymbol);
    var consequentType = symbolTable.type(consequentSymbol);
    var conditionType = symbolTable.type(conditionSymbol);

    var msg;
    if (conditionType !== "boolean") {
      msg = "The condition type must be a boolean but is " + conditionType;
      throw new Error(msg);
    }

    if (consequentType !== alternateType) {
      msg = "The consequent and alternate types must match: ";
      msg += consequentType + " !== " + alternateType;
      throw new Error(msg);
    }
    var type = consequentType;

    var alternateSymbols = symbolTable.symbols(alternateSymbol);
    var consequentSymbols = symbolTable.symbols(consequentSymbol);
    var conditionSymbols = symbolTable.symbols(conditionSymbol);

    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
    } else if (type === "integer") {
      var padded = TwosComplement.pad(consequentSymbols, alternateSymbols);
      var width = padded.leftSymbols.length;

      consequentSymbols = padded.leftSymbols;
      alternateSymbols = padded.rightSymbols;

      symbols = registry.nextInteger(width);
    }

    var symbol = registry.nextSymbol();

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);

    for (var i = 0; i < symbols.length; i += 1) {
      codeWriter.instruction({ type: "push", symbol: conditionSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: consequentSymbols[i] });
      codeWriter.instruction({ type: "push", symbol: alternateSymbols[i] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: symbols[i] });
    }
  };

  self.invariant = function () {
    var stackSymbol = stack.pop();

    var type = symbolTable.type(stackSymbol);
    var symbols = symbolTable.symbols(stackSymbol);

    if (type !== "boolean") {
      throw new Error("Wrong type for invariant: " + type);
    }

    codeWriter.instruction({ type: "push", symbol: symbols[0] });
    codeWriter.instruction({ type: "invariant" });
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
};

module.exports = InstructionSet;
