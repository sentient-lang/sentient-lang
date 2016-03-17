"use strict";

var Level3Compiler = require("./sentient/compiler/level3Compiler");
var Level2Compiler = require("./sentient/compiler/level2Compiler");
var Level1Compiler = require("./sentient/compiler/level1Compiler");

var Level3Runtime = require("./sentient/runtime/level3Runtime");
var Level2Runtime = require("./sentient/runtime/level2Runtime");
var Level1Runtime = require("./sentient/runtime/level1Runtime");

var Machine = require("./sentient/machine");
var MinisatAdapter = require("./sentient/machine/minisatAdapter");

var Sentient = function () {
  var self = this;

  self.compile = function (sourceCode) {
    var level2Code = Level3Compiler.compile(sourceCode);
    var level1Code = Level2Compiler.compile(level2Code);
    var machineCode = Level1Compiler.compile(level1Code);

    return machineCode;
  };

  self.run = function (machineCode, assignments) {
    var l2Assignments = Level3Runtime.encode(machineCode, assignments);
    var l1Assignments = Level2Runtime.encode(machineCode, l2Assignments);
    var machineAssignments = Level1Runtime.encode(machineCode, l1Assignments);

    var machine = new Machine(MinisatAdapter);
    var solution = machine.run(machineCode, machineAssignments);

    var level1Results = Level1Runtime.decode(machineCode, solution);
    var level2Results = Level2Runtime.decode(machineCode, level1Results);
    var results = Level3Runtime.decode(machineCode, level2Results);

    return results;
  };
};

Sentient.compile = function (sourceCode) {
  return new Sentient().compile(sourceCode);
};

Sentient.run = function (machineCode, assignments) {
  return new Sentient().run(machineCode, assignments);
};

module.exports = Sentient;

if (typeof window !== "undefined") {
  window.Sentient = module.exports;
}
