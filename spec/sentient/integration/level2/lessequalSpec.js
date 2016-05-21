"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'lessequal'", function () {
  it("produces the correct result for a=(-2...8), b=(-8...2)", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "lessequal" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level1Compiler.compile(program);

    for (var a = -2; a < 8; a += 1) {
      for (var b = -8; b < 2; b += 1) {
        var assignments = Level2Runtime.encode(program, { a: a, b: b });
        assignments = Level1Runtime.encode(program, assignments);

        var result = Machine.run(program, assignments)[0];

        result = Level1Runtime.decode(program, result);
        result = Level2Runtime.decode(program, result);

        expect(result.out).toEqual(result.a <= result.b);
      }
    }
  });

  it("throws an error if there are fewer than two integers", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "lessequal" }
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
          { type: "lessequal" }
        ]
      });
    }).toThrow();
  });
});
