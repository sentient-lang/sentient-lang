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

    new Level4Compiler(program, l3.callbackObject).compile();

    Logger.debug("Machine code characters: " + program.length);
    Logger.info("Finished compiling");

    return compiledProgram;
  };
};

Compiler.compile = function (program, callback) {
  return new Compiler(program, callback).compile();
};

module.exports = Compiler;
