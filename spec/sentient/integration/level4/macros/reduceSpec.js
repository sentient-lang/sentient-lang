"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Level4Compiler = require(compiler + "/level4Compiler");
var _ = require("underscore");

describe("macro: reduce", function () {
  it("calls reduce with an initial value if provided", function () {
    var instructions = Level4Compiler.compile(" \n\
      a = [1, 2, 3].reduce(0, *+);              \n\
    ").instructions;

    var reduceInstruction = _.detect(instructions, function (i) {
      return i.type === "reduce" && i.initial;
    });

    expect(reduceInstruction).toBeDefined();
  });

  it("calls reduce with no initial value if not provided", function () {
    var instructions = Level4Compiler.compile(" \n\
      a = [1, 2, 3].reduce(*+);                 \n\
    ").instructions;

    var reduceInstruction = _.detect(instructions, function (i) {
      return i.type === "reduce" && !i.initial;
    });

    expect(reduceInstruction).toBeDefined();
  });
});
