"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'pop'", function () {
  it("assigns the value on top of the stack to the variable", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "true" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(result.a).toEqual(true);
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level1Compiler.compile({
        instructions: [
          { type: "pop", symbol: "a" }
        ]
      });
    }).toThrow();
  });
});
