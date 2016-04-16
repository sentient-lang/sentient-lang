"use strict";

var Stack = require("./common/stack");
var SymbolTable = require("./common/symbolTable");
var Registry = require("./level3Compiler/registry");
var FunctionRegistry = require("./level3Compiler/functionRegistry");
var CodeWriter = require("./level3Compiler/codeWriter");
var InstructionSet = require("./level3Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var stack = new Stack();
  var typedefStack = new Stack();
  var symbolTable = new SymbolTable();
  var registry = new Registry();
  var functionRegistry = new FunctionRegistry();
  var codeWriter = new CodeWriter();
  var conditionalNils = {};

  var instructionSet = new InstructionSet({
    stack: stack,
    typedefStack: typedefStack,
    symbolTable: symbolTable,
    registry: registry,
    functionRegistry: functionRegistry,
    codeWriter: codeWriter,
    conditionalNils: conditionalNils
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
