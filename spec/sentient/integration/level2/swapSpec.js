"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'and'", function () {
  it("produces the correct result for 'false && true'", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "swap" },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" }
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.a).toEqual(true);
    expect(result.b).toEqual(false);
  });

  it("throws an error if there are fewer than two stack symbols", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "swap" }
        ]
      });
    }).toThrow();
  });
});