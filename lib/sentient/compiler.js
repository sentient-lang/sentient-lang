"use strict";

var Stack = require("./stack");
var SymbolTable = require("./symbolTable");
var Registry = require("./registry");
var CodeWriter = require("./codeWriter");
var InstructionSet = require("./instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var stack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var codeWriter = new CodeWriter();

  var instructionSet = new InstructionSet({
    stack: stack,
    symbolTable: symbolTable,
    registry: registry,
    codeWriter: codeWriter
  });

  self.compile = function () {
    if (input.metadata) {
      codeWriter.metadata(input.metadata);
    }

    _.each(input.instructions, function (instruction) {
      instructionSet.call(instruction);
    });

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;
