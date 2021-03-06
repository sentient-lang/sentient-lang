"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;
  var codeWriter, expressionParser, registry;

  var initialize = function () {
    codeWriter = params.codeWriter;
    expressionParser = withInlineFunctions(params.expressionParser);
    registry = params.registry;
  };

  self.call = function (instruction) {
    try {
      call(instruction);
    } catch (error) {
      if (typeof error.originatingLevel === "undefined") {
        error.originatingLevel = 4;
      }

      error.level4Instruction = instruction;

      throw error;
    }
  };

  /*jshint maxcomplexity:false */
  var call = function (instruction) {
    switch (instruction.type) {
      case "declaration":
        self.declaration(instruction.value);
        break;
      case "assignment":
        self.assignment(instruction.value);
        break;
      case "expose":
        self.expose(instruction.value);
        break;
      case "invariant":
        self.invariant(instruction.value);
        break;
      case "function":
        self._function(instruction.value);
        break;
      case "functionExpression":
        self.functionExpression(instruction.value);
        break;
      default:
        var message = "Unrecognised instruction: " + instruction.type;
        throw new Error(message);
    }
  };

  self.declaration = function (value) {
    var typedef = value[0];
    var symbols = value[1];

    var instructions = [];
    var name, width, instruction;

    for (var i = 0; i < typedef.length; i += 2) {
      name = typedef[i];
      width = typedef[i + 1];
      instruction = { type: "typedef" };

      if (name === "bool") {
        instruction.name = "boolean";
      } else if (name === "int") {
        instruction.name = "integer";
        instruction.width = width || 8;
      } else if (name === "array") {
        instruction.name = "array";
        instruction.width = width;
      }

      instructions.push(instruction);
    }

    var firstInstruction = instructions[0];
    firstInstruction.type = firstInstruction.name;
    delete firstInstruction.name;

    instructions.reverse();

    _.each(symbols, function (symbol) {
      var lastInstruction = _.clone(instructions.pop());
      lastInstruction.symbol = symbol;
      instructions.push(lastInstruction);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });
    });
  };

  self.assignment = function (value) {
    var symbols = value[0];
    var expressions = value[1];

    expressions.reverse();

    _.each(expressions, function (expression) {
      var instructions = expressionParser.parse(expression);
      _.each(instructions, codeWriter.instruction);
    });

    var tmpSymbols = [];

    _.each(symbols, function () {
      var tmpSymbol = registry.nextSymbol();
      codeWriter.instruction({ type: "pop", symbol: tmpSymbol });
      tmpSymbols.push(tmpSymbol);
    });

    _.each(symbols, function (symbol, index) {
      var tmpSymbol = tmpSymbols[index];
      codeWriter.instruction({ type: "push", symbol: tmpSymbol });
      codeWriter.instruction({ type: "pop", symbol: symbol });
    });
  };

  self.expose = function (value) {
    _.each(value, function (symbol) {
      codeWriter.instruction({ type: "variable", symbol: symbol });
    });
  };

  self.invariant = function (value) {
    _.each(value, function (expression) {
      var instructions = expressionParser.parse(expression);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });

      codeWriter.instruction({ type: "invariant" });
    });
  };

  self._function = function (value) {
    if (value.name === "_anonymous") {
      value.name += registry.nextAnonymous();
    }

    var define = { type: "define", name: value.name, args: value.args };

    if (value.dynamic) {
      define.dynamic = true;
    }

    if (value.immutable) {
      define.immutable = true;
    }

    codeWriter.instruction(define);

    _.each(value.body, self.call);

    var returnWidth = value.ret.shift();
    value.ret.reverse();

    _.each(value.ret, function (expression) {
      var instructions = expressionParser.parse(expression);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });
    });

    codeWriter.instruction({ type: "return", width: returnWidth });

    return value.name;
  };

  self.functionExpression = function (value) {
    var instructions = expressionParser.parse(value);

    _.each(instructions, function (instruction) {
      codeWriter.instruction(instruction);
    });
  };

  var withInlineFunctions = function (expressionParser) {
    return {
      parse: function (expression) {
        inlineFunctions(expression);
        return expressionParser.parse(expression);
      }
    };
  };

  var inlineFunctions = function (expression) {
    if (typeof expression === "object") {
      for (var i = 1; i < expression.length; i += 1) {
        var arg = expression[i];

        if (typeof arg.name !== "undefined") {
          expression[i] = "*" + self._function(arg);
        } else {
          inlineFunctions(arg);
        }
      }
    }
  };

  initialize();
};

module.exports = InstructionSet;
