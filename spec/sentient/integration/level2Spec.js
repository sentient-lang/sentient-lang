"use strict";

var Level2Compiler = require("../../../lib/sentient/compiler/level2Compiler");
var Level2Runtime = require("../../../lib/sentient/runtime/level2Runtime");

var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");

var Machine = require("../../../lib/sentient/machine");

describe("Level 2 Abstraction", function () {
  var program, level1Code;

  beforeEach(function () {
    level1Code = Level2Compiler.compile({
      metadata: {
        title: "Pythagorean Triples",
        description: "                                                         \
                                                                               \
          Find two pythagorean triples such that the hypotenuse of the first   \
          triple is one of the sides of the second.                            \
                                                                               \
          - All values must be positive integers greater than 0                \
          - The length of the larger hypotenuse must be greater than 100       \
          - Also calculates the ratio of the larger hypotenuse to the smaller  \
                                                                               \
        ",
        author: "Chris Patuzzo",
        date: "2015-11-30"
      },
      instructions: [
        // a^2 + b^2 == c^2
        { type: "integer", symbol: "a", width: 8 },
        { type: "integer", symbol: "b", width: 8 },
        { type: "integer", symbol: "c", width: 8 },
        { type: "push", symbol: "a" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "push", symbol: "b" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "add" },
        { type: "push", symbol: "c" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "equal" },
        { type: "invariant" },

        // c^2 + d^2 == e^2
        { type: "integer", symbol: "d", width: 8 },
        { type: "integer", symbol: "e", width: 8 },
        { type: "push", symbol: "c" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "push", symbol: "d" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "add" },
        { type: "push", symbol: "e" },
        { type: "duplicate" },
        { type: "multiply" },
        { type: "equal" },
        { type: "invariant" },

        // 0 < a, b, c, d, e
        { type: "constant", value: 0 },
        { type: "duplicate" },
        { type: "duplicate" },
        { type: "duplicate" },
        { type: "duplicate" },
        { type: "push", symbol: "a" },
        { type: "lessthan" },
        { type: "invariant" },
        { type: "push", symbol: "b" },
        { type: "lessthan" },
        { type: "invariant" },
        { type: "push", symbol: "c" },
        { type: "lessthan" },
        { type: "invariant" },
        { type: "push", symbol: "d" },
        { type: "lessthan" },
        { type: "invariant" },
        { type: "push", symbol: "e" },
        { type: "lessthan" },
        { type: "invariant" },

        // e > 100
        { type: "push", symbol: "e" },
        { type: "constant", value: 100 },
        { type: "greaterthan" },
        { type: "invariant" },

        // e / c
        { type: "push", symbol: "e" },
        { type: "push", symbol: "c" },
        { type: "divmod" },
        { type: "pop", symbol: "ratio" },
        { type: "pop", symbol: "remainder" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },
        { type: "variable", symbol: "e" },
        { type: "variable", symbol: "ratio" },
        { type: "variable", symbol: "remainder" }
      ]
    });

    program = Level1Compiler.compile(level1Code);
  });

  it("can find a solution", function () {
    var assignments = { a: 16 };
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result).toEqual({
      a: 16,
      b: 12,
      c: 20,
      d: 99,
      e: 101,
      ratio: 5,
      remainder: 1
    });
  });

  it("returns an empty object if there are no solutions", function () {
    var assignments = { a: 15 };
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result).toEqual({});
  });
});
