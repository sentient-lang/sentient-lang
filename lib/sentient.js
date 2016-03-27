"use strict";

var Level4Compiler = require("./sentient/compiler/level4Compiler");
var Level3Compiler = require("./sentient/compiler/level3Compiler");
var Level2Compiler = require("./sentient/compiler/level2Compiler");
var Level1Compiler = require("./sentient/compiler/level1Compiler");

var Level4Runtime = require("./sentient/runtime/level4Runtime");
var Level3Runtime = require("./sentient/runtime/level3Runtime");
var Level2Runtime = require("./sentient/runtime/level2Runtime");
var Level1Runtime = require("./sentient/runtime/level1Runtime");

var Machine = require("./sentient/machine");
var MinisatAdapter = require("./sentient/machine/minisatAdapter");

var Sentient = function () {
  var self = this;

  self.compile = function (program) {
    program = Level4Compiler.compile(program);
    program = Level3Compiler.compile(program);
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    return program;
  };

  self.run = function (program, assignments, solver) {
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(solver || MinisatAdapter);
    var results = machine.run(program, assignments);

    results = Level1Runtime.decode(program, results);
    results = Level2Runtime.decode(program, results);
    results = Level3Runtime.decode(program, results);
    results = Level4Runtime.decode(program, results);

    return results;
  };
};

Sentient.compile = function (program) {
  return new Sentient().compile(program);
};

Sentient.run = function (program, assignments, solver) {
  return new Sentient().run(program, assignments, solver);
};

module.exports = Sentient;

if (typeof window !== "undefined") {
  window.Sentient = module.exports;
}
