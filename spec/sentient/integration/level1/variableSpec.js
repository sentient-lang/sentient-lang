"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'variable'", function () {
  it("only exposes the specified variables", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "a" },
        { type: "true" },
        { type: "push", symbol: "b" },
        { type: "false" },
        { type: "pop", symbol: "c" },
        { type: "push", symbol: "d" },

        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(_.keys(result)).toEqual(["b", "c"]);
  });

  it("throws an error if the variable does not exist", function () {
    expect(function () {
      Level1Compiler.compile({
        instructions: [
          { type: "variable", symbol: "missing" }
        ]
      });
    }).toThrow();
  });
});
