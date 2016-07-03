"use strict";

var SyntaxParser = require("./level4Compiler/syntaxParser");
var ExpressionParser = require("./level4Compiler/expressionParser");
var CodeWriter = require("./level4Compiler/codeWriter");
var Registry = require("./level4Compiler/registry");
var StandardLibrary = require("./level4Compiler/standardLibrary");
var InstructionSet = require("./level4Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input, callbackObject) {
  var self = this;

  var syntaxParser = SyntaxParser;
  var expressionParser = new ExpressionParser();
  var codeWriter = new CodeWriter(callbackObject);
  var registry = new Registry();

  var instructionSet = new InstructionSet({
    codeWriter: codeWriter,
    expressionParser: expressionParser,
    registry: registry
  });

  self.compile = function () {
    codeWriter.metadata({ source: input });

    _.each(StandardLibrary.instructions, codeWriter.instruction);
    _.each(syntaxParser.parse(input), instructionSet.call);

    return codeWriter.write();
  };
};

Compiler.compile = function (input, callbackObject) {
  return new Compiler(input, callbackObject).compile();
};

module.exports = Compiler;
