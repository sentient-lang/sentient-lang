"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: fetch", function () {
  it("calls fetchIndex if index is a known constant", function () {
    var instructions = Level4Compiler.compile("\n\
      array10<int> n;                          \n\
      total = n[7] + n[8];                     \n\
      expose n, total;                         \n\
    ").instructions;

    var fetchIndexInstructions = _.select(instructions, function (i) {
      return i.type === "fetchIndex" && (i.index === 7 || i.index === 8);
    });

    expect(fetchIndexInstructions.length).toEqual(2);
  });
});
