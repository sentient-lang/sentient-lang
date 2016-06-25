"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'divmod'", function () {
  it("produces the correct result for a=(-2...8), b=(-8...2)", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "integer", symbol: "dividend", width: 6 },
        { type: "integer", symbol: "divisor", width: 6 },
        { type: "push", symbol: "dividend" },
        { type: "push", symbol: "divisor" },
        { type: "divmod" },
        { type: "pop", symbol: "quotient" },
        { type: "pop", symbol: "remainder" },
        { type: "variable", symbol: "quotient" },
        { type: "variable", symbol: "remainder" },
        { type: "variable", symbol: "dividend" },
        { type: "variable", symbol: "divisor" }
      ]
    });
    program = Level1Compiler.compile(program);

    for (var dividend = -10; dividend < 10; dividend += 1) {
      for (var divisor = -3; divisor < 3; divisor += 1) {
        var assignments = Level2Runtime.encode(program, {
          dividend: dividend,
          divisor: divisor
        });
        assignments = Level1Runtime.encode(program, assignments);

        var result = Machine.run(program, assignments)[0];

        result = Level1Runtime.decode(program, result);
        result = Level2Runtime.decode(program, result);

        // Dividing by zero produces no solutions.
        if (divisor === 0) {
          expect(result).toEqual({});
        } else {
          var total = result.quotient * divisor + result.remainder;
          expect(total).toEqual(dividend);
        }
      }
    }
  });

  it("chooses an appropriate number of bits in twos-complement", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "constant", value: -16 },
        { type: "constant", value: -1 },
        { type: "divmod" },
        { type: "pop", symbol: "q1" },
        { type: "pop", symbol: "r1" },
        { type: "variable", symbol: "q1" },
        { type: "variable", symbol: "r1" },

        { type: "constant", value: -1 },
        { type: "constant", value: 2 },
        { type: "divmod" },
        { type: "pop", symbol: "q2" },
        { type: "pop", symbol: "r2" },
        { type: "variable", symbol: "q2" },
        { type: "variable", symbol: "r2" }
      ]
    });
    program = Level1Compiler.compile(program);

    var result = Machine.run(program, {})[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result).toEqual({ q1: 16, r1: 0, q2: -1, r2: 1 });
  });

  it("throws an error if there are fewer than two integers", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "divmod" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if one of the types is incorrect", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "constant", value: true },
          { type: "divmod" }
        ]
      });
    }).toThrow();
  });
});
