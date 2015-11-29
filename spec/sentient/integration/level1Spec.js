"use strict";

var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");
var Machine = require("../../../lib/sentient/machine");

describe("Level 1 Abstraction", function () {
  var program;

  beforeEach(function () {
    program = Level1Compiler.compile({
      metadata: {
        title: "Three-Way AND",
        description: "A simple 3-bit AND gate",
        author: "Chris Patuzzo",
        date: "2015-11-25"
      },
      instructions: [
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "push", symbol: "c" },
        { type: "and" },
        { type: "and" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "out" }
      ]
    });
  });

  it("can find a solution", function () {
    var assignments = { "out": true };
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({
      "a": true,
      "b": true,
      "c": true,
      "out": true
    });
  });

  it("returns an empty object if there are no solutions", function () {
    var assignments = { "b": false, "out": true };
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({});
  });
});
