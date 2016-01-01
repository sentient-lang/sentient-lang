"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'or'", function () {
  it("produces the correct result for 'false && false'", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "constant", value: false },
        { type: "constant", value: false },
        { type: "or" },
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

  it("produces the correct result for 'true && false'", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "or" },
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

    expect(result.a).toEqual(true);
  });

  it("throws an error if there are fewer than two booleans", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: false },
          { type: "or" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if one of the types is incorrect", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "constant", value: true },
          { type: "or" }
        ]
      });
    }).toThrow();
  });
});
