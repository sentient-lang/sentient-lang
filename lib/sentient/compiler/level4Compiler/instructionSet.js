"use strict";

var _ = require("underscore");

var InstructionSet = function (params) {
  var self = this;

  var codeWriter = params.codeWriter;
  var expressionParser = params.expressionParser;
  var registry = params.registry;

  /*jshint maxcomplexity:false */
  self.call = function (instruction) {
    switch (instruction.type) {
      case "declaration":
        self.declaration(instruction.value);
        break;
      case "assignment":
        self.assignment(instruction.value);
        break;
      case "vary":
        self.vary(instruction.value);
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

  self.vary = function (value) {
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
    codeWriter.instruction({
      type: "define",
      name: value.name,
      dynamic: value.dynamic,
      args: value.args
    });

    _.each(value.body, self.call);

    var returnWidth = value.ret.shift();

    _.each(value.ret, function (expression) {
      var instructions = expressionParser.parse(expression);

      _.each(instructions, function (instruction) {
        codeWriter.instruction(instruction);
      });
    });

    codeWriter.instruction({ type: "return", width: returnWidth });
  };

  self.functionExpression = function (value) {
    var instructions = expressionParser.parse(value);

    _.each(instructions, function (instruction) {
      codeWriter.instruction(instruction);
    });
  };
};

module.exports = InstructionSet;
