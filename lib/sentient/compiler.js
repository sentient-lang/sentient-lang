"use strict";

var Level4Compiler = require("./compiler/level4Compiler");
var Level3Compiler = require("./compiler/level3Compiler");
var Level2Compiler = require("./compiler/level2Compiler");
var Level1Compiler = require("./compiler/level1Compiler");
var Logger = require("./logger");

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
    Logger.info("Compiling program...");

    Logger.debug("Program characters: " + program.length);
    program = Level4Compiler.compile(program);

    Logger.debug("Level 3 instructions: " + program.instructions.length);
    program = Level3Compiler.compile(program);

    Logger.debug("Level 2 instructions: " + program.instructions.length);
    program = Level2Compiler.compile(program);

    Logger.debug("Level 1 instructions: " + program.instructions.length);
    program = Level1Compiler.compile(program);

    Logger.debug("Machine code characters: " + program.length);
    Logger.info("Finished compiling");

    return program;
  };
};

Compiler.compile = function (program, callback) {
  return new Compiler(program, callback).compile();
};

module.exports = Compiler;
