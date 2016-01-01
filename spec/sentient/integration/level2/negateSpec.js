"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'negate'", function () {
  it("produces the correct result for a=(-2...8)", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "push", symbol: "a" },
        { type: "negate" },
        { type: "pop", symbol: "negated" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "negated" }
      ]
    });
    program = Level1Compiler.compile(program);

    for (var a = -2; a < 8; a += 1) {
      var assignments = Level2Runtime.encode(program, { a: a });
      assignments = Level1Runtime.encode(program, assignments);

      var result = Machine.run(program, assignments);

      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);

      if (a === 0) {
        expect(result.negated).toEqual(0);
      } else {
        expect(result.negated).toEqual(-result.a);
      }
    }
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "negate" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if type is not an integer", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "negate" }
        ]
      });
    }).toThrow();
  });
});
