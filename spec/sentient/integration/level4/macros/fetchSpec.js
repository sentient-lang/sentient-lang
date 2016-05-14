"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: fetch", function () {
  it("calls fetchIndex if index is a known constant", function () {
    var instructions = Level4Compiler.compile("\n\
      array4<int> n;                           \n\
      total = n[2] + n[3];                     \n\
      vary n, total;                           \n\
    ").instructions;

    var fetchIndexInstructions = _.select(instructions, function (i) {
      return i.type === "fetchIndex";
    });

    expect(fetchIndexInstructions).toEqual([
      { type: "fetchIndex", index: 2 },
      { type: "fetchIndex", index: 3 }
    ]);
  });
});
