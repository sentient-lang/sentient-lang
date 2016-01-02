"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'if'", function () {
  it("evaluates the conditional for integer expressions", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "constant", value: 123 },
        { type: "constant", value: 321 },
        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, { conditional: true });
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.out).toEqual(123);

    assignments = Level2Runtime.encode(program, { conditional: false });
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.out).toEqual(321);
  });

  it("evaluates the conditional for boolean expressions", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "constant", value: false },
        { type: "constant", value: true },
        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, { conditional: true });
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.out).toEqual(false);

    assignments = Level2Runtime.encode(program, { conditional: false });
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result.out).toEqual(true);
  });

  it("throws an error if the conditional is not a boolean", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: 0 },
          { type: "constant", value: 123 },
          { type: "constant", value: 321 },
          { type: "if" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the else branch is missing", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "constant", value: 123 },
          { type: "if" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if consequent and alternate differ in type", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "constant", value: 321 },
          { type: "if" }
        ]
      });
    }).toThrow();
  });
});
