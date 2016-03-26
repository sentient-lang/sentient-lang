"use strict";

var SyntaxParser = require("./level4Compiler/syntaxParser");
var ExpressionParser = require("./level4Compiler/expressionParser");
var CodeWriter = require("./level4Compiler/codeWriter");
var InstructionSet = require("./level4Compiler/instructionSet");
var _ = require("underscore");

var Compiler = function (input) {
  var self = this;

  var syntaxParser = new SyntaxParser();
  var expressionParser = new ExpressionParser();
  var codeWriter = new CodeWriter();

  var instructionSet = new InstructionSet({
    codeWriter: codeWriter,
    expressionParser: expressionParser
  });

  self.compile = function () {
    var ast = syntaxParser.parse(input);

    _.each(ast, function (node) {
      instructionSet.call(node);
    });

    return codeWriter.write();
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;
