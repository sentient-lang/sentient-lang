"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'if'", function () {
  it("evaluates the conditional", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "conditional" },
        { type: "false" },
        { type: "true" },
        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });

    var assignments = Level1Runtime.encode(program, { conditional: true });
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);

    expect(result.out).toEqual(false);

    var assignments = Level1Runtime.encode(program, { conditional: false });
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);

    expect(result.out).toEqual(true);
  });

  it("throws an error if the else branch is missing", function () {
    expect(function () {
      Level1Compiler.compile({
        instructions: [
          { type: "true" },
          { type: "true" },
          { type: "if" }
        ]
      });
    }).toThrow();
  });
});
