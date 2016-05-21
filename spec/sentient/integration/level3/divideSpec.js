"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");
var Level3Compiler = require(compiler + "/level3Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");
var Level3Runtime = require(runtime + "/level3Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'divide'", function () {
  it("produces the correct result for a=(-2...8), b=(-8...2)", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "integer", symbol: "dividend", width: 6 },
        { type: "integer", symbol: "divisor", width: 6 },
        { type: "push", symbol: "dividend" },
        { type: "push", symbol: "divisor" },
        { type: "divide" },
        { type: "pop", symbol: "quotient" },
        { type: "variable", symbol: "quotient" },
        { type: "variable", symbol: "dividend" },
        { type: "variable", symbol: "divisor" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    for (var dividend = -5; dividend < 5; dividend += 1) {
      for (var divisor = -3; divisor < 3; divisor += 1) {
        var assignments = Level3Runtime.encode(program, {
          dividend: dividend,
          divisor: divisor
        });
        assignments = Level2Runtime.encode(program, assignments);
        assignments = Level1Runtime.encode(program, assignments);

        var result = Machine.run(program, assignments)[0];

        result = Level1Runtime.decode(program, result);
        result = Level2Runtime.decode(program, result);
        result = Level3Runtime.decode(program, result);

        // Dividing by zero produces no solutions.
        if (divisor === 0) {
          expect(result).toEqual({});
        } else {
          var total = result.quotient * divisor;
          var remainder = dividend - total;

          expect(remainder >= 0);
          expect(remainder < Math.abs(divisor));
        }
      }
    }
  });

  it("throws an error if there are fewer than two integers", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "divide" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if one of the types is incorrect", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "constant", value: true },
          { type: "divide" }
        ]
      });
    }).toThrow();
  });
});
