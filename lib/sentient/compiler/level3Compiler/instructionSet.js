"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var typedefStack = params.typedefStack;
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
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self._boolean = function (symbol) {
    declare(symbol, "boolean", registry.nextBoolean());
  };

  self._integer = function (symbol, width) {
    declare(symbol, "integer", registry.nextInteger(), width);
  };

  self.array = function (symbol, width, typedef) {
    declare(symbol, "array", registry.nextArray(width), undefined, typedef);
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

  self.add = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "add" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for add: " + leftType + " + " + rightType;
      throw new Error(msg);
    }
  };

  self.subtract = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "subtract" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for subtract: " + leftType + " - " + rightType;
      throw new Error(msg);
    }
  };

  self.multiply = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "multiply" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for multiply: " + leftType + " * " + rightType;
      throw new Error(msg);
    }
  };

  self.divide = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "divide" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for divide: " + leftType + " / " + rightType;
      throw new Error(msg);
    }
  };

  self.modulo = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "modulo" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for modulo: " + leftType + " % " + rightType;
      throw new Error(msg);
    }
  };

  self.divmod = function () {
    var divisorSymbol = stack.pop();
    var dividendSymbol = stack.pop();

    var divisorType = symbolTable.type(divisorSymbol);
    var dividendType = symbolTable.type(dividendSymbol);

    var divisorSymbols = symbolTable.symbols(divisorSymbol);
    var dividendSymbols = symbolTable.symbols(dividendSymbol);

    var quotientSymbol = registry.nextSymbol();
    var remainderSymbol = registry.nextSymbol();

    var quotientSymbols = registry.nextInteger();
    var remainderSymbols = registry.nextInteger();

    stack.push(remainderSymbol);
    stack.push(quotientSymbol);

    symbolTable.set(quotientSymbol, "integer", quotientSymbols);
    symbolTable.set(remainderSymbol, "integer", remainderSymbols);

    if (divisorType === "integer" && dividendType === "integer") {
      codeWriter.instruction({ type: "push", symbol: dividendSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: divisorSymbols[0] });
      codeWriter.instruction({ type: "divmod" });
      codeWriter.instruction({ type: "pop", symbol: quotientSymbols[0] });
      codeWriter.instruction({ type: "pop", symbol: remainderSymbols[0] });
    } else {
      var msg = "Cannot divide a " + dividendType + " by a " + divisorType;
      throw new Error(msg);
    }
  };

  self.negate = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (stackType === "integer") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "negate" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for negate: " + stackType);
    }
  };

  self.absolute = function () {
    var stackSymbol = stack.pop();
    var stackType = symbolTable.type(stackSymbol);
    var stackSymbols = symbolTable.symbols(stackSymbol);

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    stack.push(symbol);
    symbolTable.set(symbol, "integer", symbols);

    if (stackType === "integer") {
      codeWriter.instruction({ type: "push", symbol: stackSymbols[0] });
      codeWriter.instruction({ type: "absolute" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      throw new Error("Wrong type for absolute: " + stackType);
    }
  };

  self.lessthan = function () {
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

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "lessthan" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for lessthan: " + leftType + " < " + rightType;
      throw new Error(msg);
    }
  };

  self.greaterthan = function () {
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

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "greaterthan" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for greaterthan: " + leftType + " > " + rightType;
      throw new Error(msg);
    }
  };

  self.lessequal = function () {
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

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "lessequal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for lessequal: " + leftType + " <= " + rightType;
      throw new Error(msg);
    }
  };

  self.greaterequal = function () {
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

    if (rightType === "integer" && leftType === "integer") {
      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "greaterequal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    } else {
      var msg = "Type mismatch for greaterequal: " + leftType + " >= " + rightType;
      throw new Error(msg);
    }
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

  self.variable = function (symbol, supporting) {
    supporting = supporting || false;

    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    if (type === "array") {
      _.each(symbols, function (s) {
        self.variable(s, true);
      });
    } else {
      _.each(symbols, function (s) {
        codeWriter.instruction({ type: "variable", symbol: s });
      });
    }

    codeWriter.variable(symbol, type, symbols, supporting);
  };

  self.typedef = function (name, width) {
    switch (name) {
      case "boolean":
        typedefStack.push({ type: name });
        break;
      case "integer":
        if (!width) {
          throw new Error("No width provided when defining integer type");
        }

        typedefStack.push({ type: name, width: width });
        break;
      case "array":
        if (!width) {
          throw new Error("No width provided when defining integer type");
        }

        var elements = typedefStack.pop();
        typedefStack.push({ type: name, width: width, elements: elements });
        break;
      default:
        throw new Error("Unrecognised type: '" + name + "'");
        break;
    }
  };

  self.collect = function (width) {
    var symbols = [];

    for (var i = 0; i < width; i += 1) {
      var symbol = stack.pop();
      symbols.unshift(symbol);
    }

    throwOnTypeMismatch(symbols);

    var arraySymbol = registry.nextSymbol();
    stack.push(arraySymbol);
    symbolTable.set(arraySymbol, "array", symbols);
  };

  var declare = function (symbol, type, symbols, width, typedef) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      switch (type) {
        case "boolean":
          codeWriter.instruction({ type: type, symbol: symbols[0] });
          break;
        case "integer":
          codeWriter.instruction({ type: type, symbol: symbols[0], width: width });
          break;
        case "array":
          declareElements(symbols, typedef);
          break;
      }

      symbolTable.set(symbol, type, symbols);
    }
  };

  var declareElements = function (symbols, typedef) {
    typedef = typedef || typedefStack.pop();

    _.each(symbols, function (s) {
      switch (typedef.type) {
        case "boolean":
          self._boolean(s);
          break;
        case "integer":
          self._integer(s, typedef.width);
          break;
        case "array":
          self.array(s, typedef.width, typedef.elements);
          break;
      }
    });
  };

  var throwOnTypeMismatch = function (symbols) {
    var types = _.map(symbols, recursivelyExpandTypes);

    var uniqueTypes = _.uniq(types, function (t) {
      return JSON.stringify(t);
    });

    if (uniqueTypes.length !== 1) {
      var message = "Nested arrays must have the same type hierarcy";

      _.each(types, function (t, index) {
        message += "\n" + symbols[index] + ": " + JSON.stringify(t);
      });

      throw new Error(message);
    }
  };

  var recursivelyExpandTypes = function (symbol) {
    var type = symbolTable.type(symbol);

    if (type === "array") {
      var symbols = symbolTable.symbols(symbol);
      return _.map(symbols, recursivelyExpandTypes);
    } else {
      return type;
    }
  };
};

module.exports = InstructionSet;
