"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'variable'", function () {
  it("only exposes the specified variables", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "a" },
        { type: "boolean", symbol: "b" },
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(_.keys(result)).toEqual(["b", "c"]);
  });

  it("throws an error if the variable is not declared", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "variable", symbol: "missing" }
        ]
      });
    }).toThrow();
  });
});
