"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'invariant'", function () {
  it("constraints it such that the top of the stack must be true", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "a" },
        { type: "invariant" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);

    expect(result.a).toEqual(true);
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level1Compiler.compile({
        instructions: [
          { type: "invariant" }
        ]
      });
    }).toThrow();
  });
});
