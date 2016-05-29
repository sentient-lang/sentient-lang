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

describe("Integration: 'transpose'", function () {
  it("transposes nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 2 },
        { type: "constant", value: 50 },
        { type: "constant", value: 60 },
        { type: "collect", width: 2 },
        { type: "collect", width: 3 },
        { type: "transpose" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: [[10, 30, 50], [20, 40, 60]] });
  });

  it("can transpose a nested array of different widths", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "constant", value: 40 },
        { type: "collect", width: 1 },
        { type: "constant", value: 50 },
        { type: "constant", value: 60 },
        { type: "collect", width: 2 },
        { type: "collect", width: 3 },
        { type: "transpose" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: [[10, 40, 50], [20, 60], [30]] });
  });

  it("preserves existing conditional nils", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "nested" },

        { type: "push", symbol: "nested" },
        { type: "constant", value: 40 },
        { type: "constant", value: 50 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "transpose" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: [[10, 40], [50]] });
  });

  it("returns the original array if transposed twice", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "constant", value: 40 },
        { type: "collect", width: 1 },
        { type: "constant", value: 50 },
        { type: "constant", value: 60 },
        { type: "collect", width: 2 },
        { type: "collect", width: 3 },
        { type: "transpose" },
        { type: "transpose" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: [[10, 20, 30], [40], [50, 60]] });
  });
});
