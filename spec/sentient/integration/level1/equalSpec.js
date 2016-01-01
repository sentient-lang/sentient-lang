"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'equal'", function () {
  it("produces the correct result for 'false && false'", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "false" },
        { type: "false" },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    expect(result.a).toEqual(true);
  });

  it("produces the correct result for 'true && false'", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "true" },
        { type: "false" },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    expect(result.a).toEqual(false);
  });

  it("throws an error if there are fewer than two stack symbols", function () {
    expect(function () {
      Level1Compiler.compile({
        instructions: [
          { type: "true" },
          { type: "equal" }
        ]
      });
    }).toThrow();
  });
});
