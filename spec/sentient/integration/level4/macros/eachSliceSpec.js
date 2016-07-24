"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: eachSlice", function () {
  it("calls eachSlice if index is a known constant", function () {
    var instructions = Level4Compiler.compile(" \n\
      [1, 2, 3].eachSlice(3, function () {});   \n\
    ").instructions;

    var eachSliceInstruction = _.detect(instructions, function (i) {
      return i.type === "eachSlice" && (i.width === 3);
    });

    expect(eachSliceInstruction).toBeDefined();
  });
});
