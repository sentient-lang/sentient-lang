"use strict";

var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");
var Machine = require("../../../lib/sentient/machine");

describe("Level 1 Abstraction", function () {
  var program;

  beforeEach(function () {
    program = Level1Compiler.compile({
      metadata: {
        title: "Integration",
        description: "A program that uses all instructions",
        author: "Chris Patuzzo",
        date: "2016-01-01"
      },
      instructions: [
        { type: "true" },
        { type: "push", symbol: "a" },
        { type: "and" },
        { type: "false" },
        { type: "push", symbol: "b" },
        { type: "or" },
        { type: "equal" },
        { type: "duplicate" },
        { type: "not" },
        { type: "swap" },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" }
      ]
    });
  });

  it("can find a solution", function () {
    var assignments = { d: true };
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({
      a: false,
      b: true,
      c: false,
      d: true
    });
  });

  it("returns an empty object if there are no solutions", function () {
    var assignments = { c: true, d: true };
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({});
  });
});
