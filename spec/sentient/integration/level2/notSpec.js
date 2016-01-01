"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'not'", function () {
  it("negates the value on top of the stack", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "not" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.a).toEqual(false);
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "not" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if type is not a boolean", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "not" }
        ]
      });
    }).toThrow();
  });
});
