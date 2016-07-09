"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: eachCons", function () {
  it("calls eachCons if index is a known constant", function () {
    var instructions = Level4Compiler.compile("\n\
      [1, 2, 3].eachCons(3, function () {});   \n\
    ").instructions;

    var eachConsInstruction = _.detect(instructions, function (i) {
      return i.type === "eachCons" && (i.width === 3);
    });

    expect(eachConsInstruction).toBeDefined();
  });
});
