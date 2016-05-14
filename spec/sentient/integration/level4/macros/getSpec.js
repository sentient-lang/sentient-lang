"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: get", function () {
  it("calls getIndex if index is a known constant", function () {
    var instructions = Level4Compiler.compile("\n\
      array4<int> n;                           \n\
      total = n.get(2) + n.get(3);             \n\
      vary n, total;                           \n\
    ").instructions;

    var getIndexInstructions = _.select(instructions, function (i) {
      return i.type === "getIndex";
    });

    expect(getIndexInstructions).toEqual([
      { type: "getIndex", index: 2, checkBounds: true },
      { type: "getIndex", index: 3, checkBounds: true }
    ]);
  });
});
