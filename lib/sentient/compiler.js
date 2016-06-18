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

    var compiledProgram;

    var callbackObject = {
      write: function (output) {
        compiledProgram = output;
      }
    };

    var l1 = new Level1Compiler(undefined, callbackObject);
    var l2 = new Level2Compiler(undefined, l1.callbackObject);
    var l3 = new Level3Compiler(undefined, l2.callbackObject);

    try {
      new Level4Compiler(program, l3.callbackObject).compile();
    } catch (error) {
      handleError(error);
    }

    Logger.debug("Machine code characters: " + compiledProgram.dimacs.length);
    Logger.info("Finished compiling");

    return compiledProgram;
  };

  var handleError = function (error) {
    var message = error.message;
    var level = error.originatingLevel;

    var l4 = error.level4Instruction;
    var l3 = error.level3Instruction;
    var l2 = error.level2Instruction;
    var l1 = error.level1Instruction;

    if (level === "syntax") {
      throw error;
    }

    var m = message;
    m += "\n\nStack trace:";

    if (typeof l1 !== "undefined") {
      m += "\nLevel 1 instruction: " + JSON.stringify(l1);
    }

    if (typeof l2 !== "undefined") {
      m += "\nLevel 2 instruction: " + JSON.stringify(l2);
    }

    if (typeof l3 !== "undefined") {
      m += "\nLevel 3 instruction: " + JSON.stringify(l3);
    }

    if (typeof l4 !== "undefined") {
      m += "\nLevel 4 instruction: " + JSON.stringify(l4);
    }

    m += "\n";

    throw new Error(m);
  };
};

Compiler.compile = function (program, callback) {
  return new Compiler(program, callback).compile();
};

module.exports = Compiler;
