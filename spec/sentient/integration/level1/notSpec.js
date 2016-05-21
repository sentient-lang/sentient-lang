"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'not'", function () {
  it("negates the value on top of the stack", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "false" },
        { type: "not" },
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
          { type: "not" }
        ]
      });
    }).toThrow();
  });
});
