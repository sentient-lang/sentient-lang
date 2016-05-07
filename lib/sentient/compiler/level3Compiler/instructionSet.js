/*jshint -W083 */

"use strict";

var _ = require("underscore");
var Stack = require("../common/stack");
var SymbolTable = require("../level3Compiler/symbolTable");
var DynamicScope = require("./dynamicScope");
var FunctionRegistry = require("./functionRegistry");
var FunctionScope = require("./functionScope");

var InstructionSet = function (params) {
  var self = this;
  var recording;

  var stack = params.stack;
  var typedefStack = params.typedefStack;
  var functionStack = params.functionStack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var functionRegistry = params.functionRegistry;
  var codeWriter = params.codeWriter;
  var callStack = params.callStack;

  self.stack = stack;
  self.typedefStack = typedefStack;
  self.functionStack = functionStack;
  self.symbolTable = symbolTable;
  self.registry = registry;
  self.functionRegistry = functionRegistry;
  self.codeWriter = codeWriter;
  self.callStack = callStack;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    if (record(instruction)) {
      return;
    }

    switch (instruction.type) {
      case "typedef":
        self.typedef(instruction.name, instruction.width);
        break;
      case "array":
        self.array(instruction.symbol, instruction.width);
        break;
      case "collect":
        self.collect(instruction.width);
        break;
      case "get":
        self.get(instruction.checkBounds);
        break;
      case "fetch":
        self.fetch(instruction.hasDefault);
        break;
      case "width":
        self.width();
        break;
      case "bounds":
        self.bounds();
        break;
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
      case "constant":
        self.constant(instruction.value);
        break;
      case "variable":
        self.variable(instruction.symbol);
        break;
      case "boolean":
        self._boolean(instruction.symbol);
        break;
      case "integer":
        self._integer(instruction.symbol, instruction.width);
        break;
      case "add":
        self.add();
        break;
      case "subtract":
        self.subtract();
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
      case "negate":
        self.negate();
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
      case "duplicate":
        self.duplicate();
        break;
      case "swap":
        self.swap();
        break;
      case "if":
        self._if();
        break;
      case "absolute":
        self.absolute();
        break;
      case "invariant":
        self.invariant();
        break;
      case "define":
        self.define(
          instruction.name,
          instruction.args,
          instruction.dynamic,
          instruction.immutable
        );
        break;
      case "return":
        self._return(instruction.width);
        break;
      case "call":
        self._call(instruction.name, instruction.width);
        break;
      case "pointer":
        self.pointer(instruction.name);
        break;
      case "each":
        self.each(instruction.symbol, instruction.name);
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
      throw new Error("No width provided when defining integer type");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

    declare(symbol, "integer", registry.nextInteger(), width);
  };

  self.array = function (symbol, width, typedef) {
    if (!width) {
      throw new Error("No width provided when defining array type");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

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
    var message;

    if (symbolTable.contains(symbol)) {
      var declaredType = symbolTable.type(symbol);

      if (stackType !== declaredType) {
        message = "Unable to re-assign '" + symbol + "' to a "+ stackType;
        message += " because it was previously a " + declaredType;

        throw new Error(message);
      }

      if (stackType === "array") {
        var previousHierarchy = recursivelyExpandTypes(symbol);
        var newHierarchy = recursivelyExpandTypes(stackSymbol);

        previousHierarchy = JSON.stringify(previousHierarchy);
        newHierarchy = JSON.stringify(newHierarchy);

        if (previousHierarchy !== newHierarchy) {
          message = "Unable to re-assign '" + symbol + "' because its";
          message += " type hierarchy has changed from " + previousHierarchy;
          message += " to " + newHierarchy;

          throw new Error(message);
        }
      }
    }

    symbolTable.set(symbol, stackType, stackSymbols);

    var conditions = symbolTable.getNilConditions(stackSymbol);
    symbolTable.setNilConditions(symbol, conditions);
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
      var msg = "Type mismatch for greaterthan: ";
      msg += leftType + " > " + rightType;

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
      var msg = "Type mismatch for greaterequal: ";
      msg += leftType + " >= " + rightType;

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

    var symbol = registry.nextSymbol();
    var symbols;
    var conditionsToSet = [];

    if (type === "array") {
      var maxLength;

      if (conditionSymbols.length > alternateSymbols.length) {
        maxLength = conditionSymbols.length;
      } else {
        maxLength = alternateSymbols.length;
      }

      var firstElement = consequentSymbols[0];
      firstElement = firstElement || alternateSymbols[0];
      var firstElementType = symbolTable.type(firstElement);

      var fallbackSymbol = registry.nextSymbol();
      var fallbackSymbols;

      if (firstElementType === "boolean") {
        fallbackSymbols = registry.nextBoolean();

        codeWriter.instruction({ type: "constant", value: false });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else if (firstElementType === "integer") {
        fallbackSymbols = registry.nextInteger();

        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else {
        fallbackSymbols = [];
      }

      symbolTable.set(fallbackSymbol, firstElementType, fallbackSymbols);

      var conditionIsTrueSymbol = conditionSymbols[0];
      var conditionIsFalseSymbol = registry.nextBoolean()[0];

      codeWriter.instruction({ type: "push", symbol: conditionIsTrueSymbol });
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "pop", symbol: conditionIsFalseSymbol });

      symbols = [];

      for (var index = 0; index < maxLength; index += 1) {
        var c = consequentSymbols[index];
        var a = alternateSymbols[index];

        stack.push(conditionSymbol);

        if (c) {
          stack.push(c);
        } else {
          stack.push(fallbackSymbol);

          conditionsToSet.push({
            conditionSymbol: conditionIsTrueSymbol,
            nilIndex: index
          });
        }

        if (a) {
          stack.push(a);
        } else {
          stack.push(fallbackSymbol);

          conditionsToSet.push({
            conditionSymbol: conditionIsFalseSymbol,
            nilIndex: index
          });
        }

        self._if();

        symbols.push(stack.pop());
      }

      var consequentConditions = symbolTable.getNilConditions(consequentSymbol);
      _.each(consequentConditions, function (c) {
        var conditionSymbol = registry.nextBoolean()[0];

        codeWriter.instruction({ type: "push", symbol: conditionIsTrueSymbol });
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

        conditionsToSet.push({
          conditionSymbol: conditionSymbol,
          nilIndex: c.nilIndex
        });
      });

      var alternateConditions = symbolTable.getNilConditions(alternateSymbol);
      _.each(alternateConditions, function (c) {
        var conditionSymbol = registry.nextBoolean()[0];

        codeWriter.instruction({ type: "push", symbol: conditionIsFalseSymbol});
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
        codeWriter.instruction({ type: "and" });
        codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

        conditionsToSet.push({
          conditionSymbol: conditionSymbol,
          nilIndex: c.nilIndex
        });
      });
    } else {
      if (type === "boolean") {
        symbols = registry.nextBoolean();
      } else if (type === "integer") {
        symbols = registry.nextInteger();
      }

      codeWriter.instruction({ type: "push", symbol: conditionSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: consequentSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: alternateSymbols[0] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
    }

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);

    if (conditionsToSet.length > 0) {
      symbolTable.setNilConditions(symbol, conditionsToSet);
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

  self.variable = function (symbol, supporting, nilDecider) {
    supporting = supporting || false;

    var type = symbolTable.type(symbol);
    var symbols = symbolTable.symbols(symbol);

    if (type === "array") {
      _.each(symbols, function (s, index) {
        var outOfBoundsSymbol = checkBoundsForIndex(symbol, index);

        if (outOfBoundsSymbol) {
          self.variable(outOfBoundsSymbol, true);
        }

        self.variable(s, true, outOfBoundsSymbol);
      });
    } else {
      _.each(symbols, function (s) {
        codeWriter.instruction({ type: "variable", symbol: s });
      });
    }

    codeWriter.variable(symbol, type, symbols, supporting, nilDecider);
  };

  self.typedef = function (name, width) {
    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

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
    }
  };

  self.collect = function (width) {
    if (!width) {
      throw new Error("No width provided when collecting elements");
    }

    if (width <= 0) {
      throw new Error("width must be a positive integer");
    }

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

  self.get = function (checkBounds, keySymbol) {
    keySymbol = keySymbol || stack.pop();
    var arraySymbol = stack.pop();

    var keyType = symbolTable.type(keySymbol);
    var arrayType = symbolTable.type(arraySymbol);

    var keySymbols = symbolTable.symbols(keySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (keyType !== "integer") {
      throw new Error("Attempting to get with a non-integer key");
    }

    if (arrayType !== "array") {
      throw new Error("Attempting to get from a non-array");
    }

    var firstElement = arraySymbols[0];

    if (typeof firstElement === "undefined") {
      throw new Error("Attempting to get from an empty array");
    }

    var elementType = symbolTable.type(firstElement);
    var valueSymbol, valueSymbols, fallbackValue;
    var outOfBoundsSymbol, outOfBoundsSymbols, i;

    if (checkBounds || elementType === "array") {
      stack.push(arraySymbol);
      stack.push(keySymbol);

      self.bounds();
      self.not();

      outOfBoundsSymbol = stack.pop();
      outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);
    }

    if (checkBounds) {
      stack.push(outOfBoundsSymbol);
    }

    if (elementType === "array") {
      var nestedArrays = _.map(arraySymbols, function (symbol) {
        return symbolTable.symbols(symbol);
      });

      var maxWidth = _.max(nestedArrays, "length").length;

      firstElement = _.flatten(nestedArrays)[0];
      var firstElementType = symbolTable.type(firstElement);

      var fallbackSymbol = registry.nextSymbol();
      var fallbackSymbols;

      if (firstElementType === "boolean") {
        fallbackSymbols = registry.nextBoolean();

        codeWriter.instruction({ type: "constant", value: false });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else if (firstElementType === "integer") {
        fallbackSymbols = registry.nextInteger();

        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "pop", symbol: fallbackSymbols[0] });
      } else {
        fallbackSymbols = [];
      }

      symbolTable.set(fallbackSymbol, firstElementType, fallbackSymbols);

      var conditionsToSet = [];

      for (i = 0; i < maxWidth; i += 1) {
        var transposedSymbol = registry.nextSymbol();
        var transposedSymbols = [];

        _.each(nestedArrays, function (nestedArray, arrayIndex) {
          var nestedSymbol = nestedArray[i];

          if (nestedSymbol) {
            transposedSymbols.push(nestedSymbol);
          } else {
            transposedSymbols.push(fallbackSymbol);

            var conditionSymbol = registry.nextBoolean()[0];

            codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
            codeWriter.instruction({ type: "constant", value: arrayIndex });
            codeWriter.instruction({ type: "equal" });
            codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

            conditionsToSet.push({
              conditionSymbol: conditionSymbol,
              nilIndex: i
            });
          }
        });

        stack.push(transposedSymbol);
        symbolTable.set(transposedSymbol, "array", transposedSymbols);

        self.get(false, keySymbol);
      }

      self.collect(maxWidth);

      valueSymbol = stack.pop();
      valueSymbols = symbolTable.symbols(valueSymbol);

      _.each(arraySymbols, function (arraySymbol, arrayIndex) {
        var existingConditions = symbolTable.getNilConditions(arraySymbol);
        existingConditions = existingConditions || [];

        _.each(existingConditions, function (c) {
          var conditionSymbol = c.conditionSymbol;

          codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
          codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
          codeWriter.instruction({ type: "constant", value: arrayIndex });
          codeWriter.instruction({ type: "equal" });
          codeWriter.instruction({ type: "and" });
          codeWriter.instruction({ type: "pop", symbol: conditionSymbol });

          conditionsToSet.push({
            conditionSymbol: conditionSymbol,
            nilIndex: c.nilIndex
          });
        });
      });

      conditionsToSet.push({ conditionSymbol: outOfBoundsSymbols[0] });
      symbolTable.setNilConditions(valueSymbol, conditionsToSet);
    } else {
      valueSymbol = registry.nextSymbol();

      if (elementType === "boolean") {
        valueSymbols = registry.nextBoolean();
        fallbackValue = false;
      } else if (elementType === "integer") {
        valueSymbols = registry.nextInteger();
        fallbackValue = 0;
      }

      for (i = 0; i < arraySymbols.length; i += 1) {
        var elementSymbol = arraySymbols[i];
        var elementSymbols = symbolTable.symbols(elementSymbol);

        codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
        codeWriter.instruction({ type: "constant", value: i });
        codeWriter.instruction({ type: "equal" });
        codeWriter.instruction({ type: "push", symbol: elementSymbols[0] });
      }

      codeWriter.instruction({ type: "constant", value: fallbackValue });

      for (i = 0; i < arraySymbols.length; i += 1) {
        codeWriter.instruction({ type: "if" });
      }

      codeWriter.instruction({ type: "pop", symbol: valueSymbols[0] });
    }

    stack.push(valueSymbol);
    symbolTable.set(valueSymbol, elementType, valueSymbols);
  };

  self.fetch = function (hasDefault) {
    var defaultSymbol;

    if (hasDefault) {
      defaultSymbol = stack.pop();
    }

    self.get(true);
    self.swap();

    var outOfBoundsSymbol = stack.pop();
    var outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);

    codeWriter.instruction({ type: "push", symbol: outOfBoundsSymbols[0] });

    if (!hasDefault) {
      codeWriter.instruction({ type: "not" });
      codeWriter.instruction({ type: "invariant" });
    } else {
      var defaultSymbols =  symbolTable.symbols(defaultSymbol);
      var defaultType = symbolTable.type(defaultSymbol);

      var valueSymbol = stack.pop();
      var valueSymbols = symbolTable.symbols(valueSymbol);
      var valueType = symbolTable.type(valueSymbol);

      var message;

      if (valueType === "array") {
        message = "Default values are not supported when fetching";
        message += " from nested arrays";

        throw new Error(message);
      }

      if (defaultType !== valueType) {
        message = "Unable to set a default value with type '" + defaultType;
        message += "' for an array with elements of type '" + valueType + "'";

        throw new Error(message);
      }

      var outputSymbol = registry.nextSymbol();
      var outputSymbols;

      if (valueType === "integer") {
        outputSymbols = registry.nextInteger();
      } else if (valueType === "boolean") {
        outputSymbols = registry.nextBoolean();
      }

      codeWriter.instruction({ type: "push", symbol: defaultSymbols[0] });

      codeWriter.instruction({ type: "push", symbol: valueSymbols[0] });
      codeWriter.instruction({ type: "if" });
      codeWriter.instruction({ type: "pop", symbol: outputSymbols[0] });

      symbolTable.set(outputSymbol, valueType, outputSymbols);
      stack.push(outputSymbol);
    }
  };

  self.width = function () {
    var arraySymbol = stack.pop();
    var arrayType = symbolTable.type(arraySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (arrayType !== "array") {
      throw new Error("Attempting to check bounds of a non-array");
    }

    var symbol = registry.nextSymbol();
    var symbols = registry.nextInteger();

    symbolTable.set(symbol, "integer", symbols);
    stack.push(symbol);

    var definiteWidth = 0;
    var uncertainWidth = 0;

    _.each(arraySymbols, function (symbol, index) {
      var outOfBoundsSymbol = checkBoundsForIndex(arraySymbol, index);

      if (outOfBoundsSymbol) {
        var outOfBoundsSymbols = symbolTable.symbols(outOfBoundsSymbol);

        codeWriter.instruction({ type: "push", symbol: outOfBoundsSymbols[0] });
        codeWriter.instruction({ type: "constant", value: 0 });
        codeWriter.instruction({ type: "constant", value: 1 });
        codeWriter.instruction({ type: "if" });

        uncertainWidth += 1;
      } else {
        definiteWidth += 1;
      }
    });

    codeWriter.instruction({ type: "constant", value: definiteWidth });

    for (var i = 0; i < uncertainWidth; i += 1) {
      codeWriter.instruction({ type: "add" });
    }

    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.bounds = function (skipBoundaries) {
    var keySymbol = stack.pop();
    var arraySymbol = stack.pop();

    var keyType = symbolTable.type(keySymbol);
    var arrayType = symbolTable.type(arraySymbol);

    var keySymbols = symbolTable.symbols(keySymbol);
    var arraySymbols = symbolTable.symbols(arraySymbol);

    if (keyType !== "integer") {
      throw new Error("Attempting to check bounds a with a non-integer key");
    }

    if (arrayType !== "array") {
      throw new Error("Attempting to check bounds of a non-array");
    }

    var symbol = registry.nextSymbol();
    var symbols = registry.nextBoolean();

    symbolTable.set(symbol, "boolean", symbols);
    stack.push(symbol);

    if (!skipBoundaries) {
      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: 0 });
      codeWriter.instruction({ type: "lessthan" });
      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: arraySymbols.length });
      codeWriter.instruction({ type: "greaterequal" });
      codeWriter.instruction({ type: "or" });
    } else {
      codeWriter.instruction({ type: "constant", value: true });
    }

    var conditions = symbolTable.getNilConditions(arraySymbol);
    if (conditions) {
      _.each(conditions, function (c) {
        codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });

        if (typeof c.nilIndex !== "undefined") {
          codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
          codeWriter.instruction({ type: "constant", value: c.nilIndex });
          codeWriter.instruction({ type: "equal" });
          codeWriter.instruction({ type: "and" });
        }

        codeWriter.instruction({ type: "or" });
      });
    }

    codeWriter.instruction({ type: "not" });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });
  };

  self.constant = function (value) {
    var symbol = registry.nextSymbol();
    var type = typeName(value);

    if (typeof type === "undefined") {
      var message = "Constants are only supported for types";
      message += " 'boolean' and 'integer'";

      throw new Error(message);
    }

    var symbols;

    if (type === "boolean") {
      symbols = registry.nextBoolean();
    } else if (type === "integer") {
      symbols = registry.nextInteger();
    }

    codeWriter.instruction({ type: "constant", value: value });
    codeWriter.instruction({ type: "pop", symbol: symbols[0] });

    stack.push(symbol);
    symbolTable.set(symbol, type, symbols);
  };

  self.equal = function () {
    var rightSymbol = stack.pop();
    var leftSymbol = stack.pop();

    var rightType = symbolTable.type(rightSymbol);
    var leftType = symbolTable.type(leftSymbol);

    if (rightType !== leftType) {
      var msg = "Type mismatch for equals: " + leftType + " == " + rightType;
      throw new Error(msg);
    }

    var rightSymbols = symbolTable.symbols(rightSymbol);
    var leftSymbols = symbolTable.symbols(leftSymbol);

    if (rightType === "array") {
      var maxLength;

      if (rightSymbols.length > leftSymbols.length) {
        maxLength = rightSymbols.length;
      } else {
        maxLength = leftSymbols.length;
      }

      var definitelyNotEqual, rightOutOfBoundsSymbol, leftOutOfBoundsSymbol;
      var r, l, index;

      for (index = 0; index < maxLength; index += 1) {
        leftOutOfBoundsSymbol = checkBoundsForIndex(leftSymbol, index);
        rightOutOfBoundsSymbol = checkBoundsForIndex(rightSymbol, index);

        l = leftSymbols[index];
        r = rightSymbols[index];

        if (!l && !rightOutOfBoundsSymbol) {
          definitelyNotEqual = true;
        }

        if (!r && !leftOutOfBoundsSymbol) {
          definitelyNotEqual = true;
        }
      }

      if (definitelyNotEqual) {
        self.constant(false);
        return;
      }

      for (index = 0; index < maxLength; index += 1) {
        leftOutOfBoundsSymbol = checkBoundsForIndex(leftSymbol, index);
        rightOutOfBoundsSymbol = checkBoundsForIndex(rightSymbol, index);

        l = leftSymbols[index];
        r = rightSymbols[index];

        if (l && r) {
          stack.push(l);
          stack.push(r);
          self.equal();
        } else {
          self.constant(true);
        }

        if (leftOutOfBoundsSymbol && rightOutOfBoundsSymbol) {
          stack.push(leftOutOfBoundsSymbol);
          stack.push(rightOutOfBoundsSymbol);

          self.equal();
        } else if (leftOutOfBoundsSymbol) {
          stack.push(leftOutOfBoundsSymbol);

          if (r) {
            self.not();
          }
        } else if (rightOutOfBoundsSymbol) {
          stack.push(rightOutOfBoundsSymbol);

          if (l) {
            self.not();
          }
        } else {
          self.constant(true);
        }

        self.and();
      }

      for (var i = 0; i < maxLength - 1; i += 1) {
        self.and();
      }
    } else {
      var symbol = registry.nextSymbol();
      var symbols = registry.nextBoolean();

      codeWriter.instruction({ type: "push", symbol: leftSymbols[0] });
      codeWriter.instruction({ type: "push", symbol: rightSymbols[0] });
      codeWriter.instruction({ type: "equal" });
      codeWriter.instruction({ type: "pop", symbol: symbols[0] });

      stack.push(symbol);
      symbolTable.set(symbol, "boolean", symbols);
    }
  };

  self.define = function (name, args, dynamic, immutable) {
    if (typeof name === "undefined") {
      throw new Error("Cannot define a function without a name");
    }

    if (typeof args === "undefined") {
      throw new Error("Cannot define a function without an array of args");
    }

    recording = {
      name: name,
      args: args,
      body: [],
      dynamic: dynamic,
      immutable: immutable,
      depth: 1
    };
  };

  self._return = function (width) {
    if (typeof width === "undefined") {
      throw new Error("Must specify the 'width' of arguments for return");
    }

    if (typeof recording === "undefined") {
      throw new Error("No function to return from");
    }

    functionRegistry.register(
      recording.name,
      recording.args,
      recording.body,
      recording.dynamic,
      recording.immutable,
      width
    );

    recording = undefined;
  };

  self._call = function (name, width) {
    if (typeof name === "undefined") {
      throw new Error("Cannot call a function without a name");
    }

    if (typeof width === "undefined") {
      throw new Error("Must specify argument width when calling function");
    }

    var fn = functionRegistry.get(name);
    var message;

    if (width !== fn.args.length) {
      message = name + ": wrong number of arguments";
      message += " (given " + width + ", expected " + fn.args.length + ")";

      throw new Error(message);
    }

    var instructionSet = scopedInstructionSet(fn);

    setupInstructionSet(instructionSet, fn);

    for (var i = 0; i < fn.body.length; i += 1) {
      var instruction = fn.body[i];
      instructionSet.call(instruction);
    }

    teardownInstructionSet(instructionSet, fn);

    return instructionSet;
  };

  self.pointer = function (name) {
    if (typeof name === "undefined") {
      throw new Error("Unable to create a function pointer without a name");
    }

    if (name[0] === "*") {
      functionStack.push(name.substring(1));
    } else {
      functionStack.push(name);
    }
  };

  self.each = function () {
    var arraySymbol = stack.pop();
    var functionName = functionStack.pop();

    var type = symbolTable.type(arraySymbol);
    var symbols = symbolTable.symbols(arraySymbol);
    var message;

    if (type !== "array") {
      message = "Wrong type for each. Called each on '" + arraySymbol;
      message += "' which is a " + type;

      throw new Error(message);
    }

    var fn = functionRegistry.get(functionName);

    if (fn.args.length === 0 || fn.args.length > 3) {
      message = "Tried to call 'each' on '" + arraySymbol + "' with";
      message += " function '" + fn.name + "' that takes " + fn.args.length;
      message += " arguments. 'each' can only be called with functions that";
      message += " take 1, 2 or 3 arguments.";

      throw new Error(message);
    }

    var checkBounds = fn.args.length === 3;
    var yieldIndex = fn.args.length >= 2;

    for (var i = 0; i < symbols.length; i += 1) {
      var elementSymbol = symbols[i];
      self.push(elementSymbol);

      if (yieldIndex) {
        self.constant(i);
      }

      if (checkBounds) {
        var outOfBoundsSymbol = checkBoundsForIndex(arraySymbol, i);

        if (outOfBoundsSymbol) {
          self.push(outOfBoundsSymbol);
          self.not();
        } else {
          self.constant(false);
        }
      }

      self._call(fn.name, fn.args.length);
    }

    self.push(arraySymbol);
  };

  var scopedInstructionSet = function (fn) {
    var scopedSymbolTable;
    var localTable = new SymbolTable();

    if (fn.dynamic) {
      scopedSymbolTable = new DynamicScope(symbolTable, localTable);
    } else {
      scopedSymbolTable = localTable;
    }

    var localRegistry = new FunctionRegistry(registry);
    var scopedFunctionRegistry = new FunctionScope(
      functionRegistry,
      localRegistry
    );

    var instructionSet = new InstructionSet({
      stack: new Stack(),
      typedefStack: new Stack(),
      functionStack: new Stack(),
      symbolTable: scopedSymbolTable,
      registry: params.registry,
      functionRegistry: scopedFunctionRegistry,
      codeWriter: params.codeWriter,
      callStack: callStack.add(fn.id, fn.name)
    });

    return instructionSet;
  };

  var setupInstructionSet = function (instructionSet, fn) {
    for (var i = fn.args.length - 1; i >= 0; i -= 1) {
      var arg = fn.args[i];

      if (isFunctionPointer(arg)) {
        var name = functionStack.pop();
        var newName = arg;

        copyFunction(name, newName, self, instructionSet);
      } else {
        var symbol = stack.pop();
        var newSymbol = arg;

        copySymbol(symbol, newSymbol, self, instructionSet);
      }
    }
  };

  var teardownInstructionSet = function (instructionSet, fn) {
    var symbols = [], i, symbol;

    for (i = 0; i < fn.returns; i += 1) {
      symbols.push(instructionSet.stack.pop());
    }

    var newSymbols = [];

    for (i = 0; i < fn.returns; i += 1) {
      symbol = symbols[i];
      var newSymbol = registry.nextSymbol();

      copySymbol(symbol, newSymbol, instructionSet, self);
      newSymbols.push(newSymbol);
    }

    newSymbols.reverse();

    for (i = 0; i < fn.returns; i += 1) {
      stack.push(newSymbols[i]);
    }

    var reassignedArrays = instructionSet.symbolTable.reassignedArrays;

    if (typeof reassignedArrays === "undefined") {
      return;
    }

    for (i = 0; i < reassignedArrays.length; i += 1) {
      symbol = reassignedArrays[i];
      copySymbol(symbol, symbol, instructionSet, self);
    }
  };

  var copySymbol = function (symbol, newSymbol, from, to) {
    var type = from.symbolTable.type(symbol);
    var symbols = from.symbolTable.symbols(symbol);

    if (type === "array") {
      var newElementSymbols = [];

      for (var i = 0; i < symbols.length; i += 1) {
        var elementSymbol = symbols[i];
        var newElementSymbol = registry.nextSymbol();

        copySymbol(elementSymbol, newElementSymbol, from, to);

        newElementSymbols.push(newElementSymbol);
      }

      symbols = newElementSymbols;
    }

    to.symbolTable.set(newSymbol, type, symbols, true);

    var conditions = from.symbolTable.getNilConditions(symbol);

    if (conditions) {
      to.symbolTable.setNilConditions(newSymbol, conditions);
    }
  };

  var copyFunction = function (name, newName, from, to) {
    newName = newName.substring(1);
    var fn = from.functionRegistry.get(name);

    to.functionRegistry.register(
      newName,
      fn.args,
      fn.body,
      fn.dynamic,
      fn.immutable,
      fn.returns
    );

    var newFn = to.functionRegistry.get(newName);
    newFn.id = fn.id;
  };

  var declare = function (symbol, type, symbols, width, typedef) {
    if (symbolTable.contains(symbol)) {
      throw new Error(type + " '" + symbol + "' has already been declared");
    } else {
      switch (type) {
        case "boolean":
          codeWriter.instruction({
            type: type,
            symbol: symbols[0]
          });
          break;
        case "integer":
          codeWriter.instruction({
            type: type,
            symbol: symbols[0],
            width: width
          });
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
      var message = "Nested arrays must have the same type hierarchy";

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
      var types = _.map(symbols, recursivelyExpandTypes);
      var uniqueTypes = _.uniq(types, function (t) {
        return JSON.stringify(t);
      });

      return uniqueTypes;
    } else {
      return type;
    }
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    }
  };

  var checkBoundsForIndex = function (arraySymbol, index) {
    var conditions = symbolTable.getNilConditions(arraySymbol);
    var outOfBoundsSymbol;

    var conditionsForIndex = _.select(conditions, function (c) {
      return !c.nilIndex || c.nilIndex === index;
    });

    _.each(conditionsForIndex, function (c) {
      codeWriter.instruction({ type: "push", symbol: c.conditionSymbol });
    });

    for (var i = 0; i < conditionsForIndex.length - 1; i += 1) {
      codeWriter.instruction({ type: "or" });
    }

    if (_.any(conditionsForIndex)) {
      outOfBoundsSymbol = registry.nextSymbol();
      var symbols = registry.nextBoolean();

      codeWriter.instruction({ type: "pop", symbol: symbols[0] });
      symbolTable.set(outOfBoundsSymbol, "boolean", symbols);
    }

    return outOfBoundsSymbol;
  };

  var record = function (instruction) {
    if (typeof recording !== "undefined") {
      if (instruction.type === "define") {
        recording.depth += 1;
      } else if (instruction.type === "return") {
        recording.depth -= 1;

        if (recording.depth === 0) {
          return;
        }
      }

      recording.body.push(instruction);
      return true;
    }
  };

  var isFunctionPointer = function (name) {
    return name[0] === "*";
  };
};

module.exports = InstructionSet;
