/*jshint -W083 */

"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var stack = params.stack;
  var typedefStack = params.typedefStack;
  var symbolTable = params.symbolTable;
  var registry = params.registry;
  var codeWriter = params.codeWriter;
  var conditionalNils = params.conditionalNils;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
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
      case "absolute":
        self.absolute();
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

    if (symbolTable.contains(symbol)) {
      var declaredType = symbolTable.type(symbol);

      if (stackType !== declaredType) {
        var message = "unable to assign " + stackType + " to ";
        message += declaredType + " '" + symbol + "'";
        throw new Error(message);
      }
    }

    conditionalNils[symbol] = conditionalNils[stackSymbol];
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
      var conditions = conditionalNils[symbol];

      _.each(symbols, function (s, index) {
        var checkBounds = function (arraySymbol, index) {
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

        var outOfBoundsSymbol = checkBounds(symbol, index);

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
      throw new Error("Attempting to get a with a non-integer key");
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
    var outOfBoundsSymbols, i;

    if (checkBounds || elementType === "array") {
      outOfBoundsSymbols = registry.nextBoolean();

      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: 0 });
      codeWriter.instruction({ type: "lessthan" });
      codeWriter.instruction({ type: "push", symbol: keySymbols[0] });
      codeWriter.instruction({ type: "constant", value: arraySymbols.length });
      codeWriter.instruction({ type: "greaterequal" });
      codeWriter.instruction({ type: "or" });

      var conditions = conditionalNils[arraySymbol];
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

      codeWriter.instruction({ type: "pop", symbol: outOfBoundsSymbols[0] });
    }

    if (checkBounds) {
      var outOfBoundsSymbol = registry.nextSymbol();

      symbolTable.set(outOfBoundsSymbol, "boolean", outOfBoundsSymbols);
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
        var existingConditions = conditionalNils[arraySymbol];
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
      conditionalNils[valueSymbol] = conditionsToSet;
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

    var conditions = conditionalNils[arraySymbol];
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

    if (rightSymbols.length !== leftSymbols.length) {
      self.constant(false);
      return;
    }

    if (rightType === "array") {
      _.each(rightSymbols, function (r, index) {
        var l = leftSymbols[index];

        stack.push(l);
        stack.push(r);

        self.equal();
      });

      for (var i = 0; i < rightSymbols.length - 1; i += 1) {
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
    } else {
      throw new Error("Constants of type '" + t + "' are not supported");
    }
  };
};

module.exports = InstructionSet;
