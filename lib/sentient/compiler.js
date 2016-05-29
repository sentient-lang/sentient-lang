"use strict";

var Level4Compiler = require("./compiler/level4Compiler");
var Level3Compiler = require("./compiler/level3Compiler");
var Level2Compiler = require("./compiler/level2Compiler");
var Level1Compiler = require("./compiler/level1Compiler");

var Compiler = function (program, callback) {
  var self = this;

  self.compile = function () {
    if (typeof callback === "undefined") {
      return compile();
    } else {
      return setTimeout(function () {
        callback(compile());
      }, 0);
    }
  };

  var compile = function () {
    program = Level4Compiler.compile(program);
    program = Level3Compiler.compile(program);
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    return program;
  };
};

Compiler.compile = function (program, callback) {
  return new Compiler(program, callback).compile();
};

module.exports = Compiler;
