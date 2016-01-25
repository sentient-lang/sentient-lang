"use strict";

var Level2Compiler = require("./sentient/compiler/level2Compiler");
var Level2Runtime = require("./sentient/runtime/level2Runtime");

var Level1Compiler = require("./sentient/compiler/level1Compiler");
var Level1Runtime = require("./sentient/runtime/level1Runtime");

var Machine = require("./sentient/machine");
var MiniSatAdapter = require("./sentient/machine/miniSatAdapter");

var Sentient = function () {
  var self = this;

  self.compile = function (input) {
    var level1Code = Level2Compiler.compile(input);
    var program = Level1Compiler.compile(level1Code);

    return program;
  };

  self.run = function (program, assignments) {
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(MiniSatAdapter);
    var result = machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    return result;
  };
};

Sentient.compile = function (input) {
  return new Sentient().compile(input);
};

Sentient.run = function (program, assignments) {
  return new Sentient().run(program, assignments);
};

module.exports = Sentient;

if (typeof window !== "undefined") {
  window.Sentient = module.exports;
}
