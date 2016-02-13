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

describe("Integration: 'absolute'", function () {
  it("produces the correct result for a=(-2...8)", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "push", symbol: "a" },
        { type: "absolute" },
        { type: "pop", symbol: "abs" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "abs" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    for (var a = -2; a < 8; a += 1) {
      var assignments = Level3Runtime.encode(program, { a: a });
      assignments = Level2Runtime.encode(program, assignments);
      assignments = Level1Runtime.encode(program, assignments);

      var result = Machine.run(program, assignments);

      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);
      result = Level3Runtime.decode(program, result);

      expect(result.abs).toEqual(Math.abs(result.a));
    }
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "absolute" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if type is not an integer", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "absolute" }
        ]
      });
    }).toThrow();
  });
});
