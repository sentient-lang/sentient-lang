"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./common/symbolTable");
var Registry = require("./level2Compiler/registry");
var CodeWriter = require("./level2Compiler/codeWriter");
var InstructionSet = require("./level2Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input, callbackObject) {
  var self = this;

  var stack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var codeWriter = new CodeWriter(callbackObject);

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

  self.callbackObject = {
    metadata: codeWriter.metadata,
    call: instructionSet.call,
    write: codeWriter.write
  };
};

Compiler.compile = function (input, callbackObject) {
  return new Compiler(input, callbackObject).compile();
};

module.exports = Compiler;
