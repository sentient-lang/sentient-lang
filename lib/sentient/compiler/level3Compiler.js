"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./level3Compiler/symbolTable");
var Registry = require("./level3Compiler/registry");
var FunctionRegistry = require("./level3Compiler/functionRegistry");
var CodeWriter = require("./level3Compiler/codeWriter");
var CallStack = require("./level3Compiler/callStack");
var InstructionSet = require("./level3Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input, callbackObject) {
  var self = this;

  var stack = new Stack();
  var typedefStack = new Stack();
  var functionStack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var functionRegistry = new FunctionRegistry(registry);
  var codeWriter = new CodeWriter(callbackObject);
  var callStack = new CallStack();

  var instructionSet = new InstructionSet({
    stack: stack,
    typedefStack: typedefStack,
    functionStack: functionStack,
    symbolTable: symbolTable,
    registry: registry,
    functionRegistry: functionRegistry,
    codeWriter: codeWriter,
    callStack: callStack
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
