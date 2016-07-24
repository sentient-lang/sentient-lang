"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: eachCombination", function () {
  it("calls eachCombination if index is a known constant", function () {
    var instructions = Level4Compiler.compile("     \n\
      [1, 2, 3].eachCombination(3, function () {}); \n\
    ").instructions;

    var eachCombinationInstruction = _.detect(instructions, function (i) {
      return i.type === "eachCombination" && (i.width === 3);
    });

    expect(eachCombinationInstruction).toBeDefined();
  });
});
