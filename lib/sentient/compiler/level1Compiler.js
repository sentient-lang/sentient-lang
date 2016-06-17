"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./level1Compiler/symbolTable");
var Registry = require("./level1Compiler/registry");
var CodeWriter = require("./level1Compiler/codeWriter");
var InstructionSet = require("./level1Compiler/instructionSet");
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
