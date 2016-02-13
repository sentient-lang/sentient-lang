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

describe("Integration: 'invariant'", function () {
  it("constraints it such that the top of the stack must be true", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "push", symbol: "a" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "invariant" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(5);
  });

  it("throws an error if the sta", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "invariant" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "invariant" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the stack contains a non-boolean", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "invariant" }
        ]
      });
    }).toThrow();
  });
});
