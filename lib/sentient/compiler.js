"use strict";

var Level4Compiler = require("./compiler/level4Compiler");
var Level3Compiler = require("./compiler/level3Compiler");
var Level2Compiler = require("./compiler/level2Compiler");
var Level1Compiler = require("./compiler/level1Compiler");

var Compiler = function (program) {
  var self = this;

  self.compile = function () {
    program = Level4Compiler.compile(program);
    program = Level3Compiler.compile(program);
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    return program;
  };
};

Compiler.compile = function (program) {
  return new Compiler(program).compile();
};

module.exports = Compiler;
