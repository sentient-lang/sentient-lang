"use strict";

var SyntaxParser = require("./level4Compiler/syntaxParser");
var ExpressionParser = require("./level4Compiler/expressionParser");
var CodeWriter = require("./level4Compiler/codeWriter");
var StandardLibrary = require("./level4Compiler/standardLibrary");
var InstructionSet = require("./level4Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var syntaxParser = SyntaxParser;
  var expressionParser = new ExpressionParser();
  var codeWriter = new CodeWriter();
  var standardLibrary = new StandardLibrary();

  var instructionSet = new InstructionSet({
    codeWriter: codeWriter,
    expressionParser: expressionParser
  });

  self.compile = function () {
    _.each(standardLibrary.instructions, codeWriter.instruction);
    _.each(syntaxParser.parse(input), instructionSet.call);

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;
