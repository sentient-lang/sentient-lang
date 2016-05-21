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

describe("Integration: 'if'", function () {
  it("evaluates the conditional for integer expressions", function () {
    var program = Level3Compiler.compile({
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
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, { conditional: true });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual(123);

    assignments = Level3Runtime.encode(program, { conditional: false });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual(321);
  });

  it("evaluates the conditional for boolean expressions", function () {
    var program = Level3Compiler.compile({
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
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, { conditional: true });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual(false);

    assignments = Level3Runtime.encode(program, { conditional: false });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual(true);
  });

  it("evaluates the conditional for array expressions", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "collect", width: 1 },
        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, { conditional: true });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([10]);

    assignments = Level3Runtime.encode(program, { conditional: false });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([20]);
  });

  it("works correctly for arrays of different length", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, { conditional: true });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([10]);

    assignments = Level3Runtime.encode(program, { conditional: false });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([20, 30]);
  });

  it("integrates correctly with fetch", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        // if conditional then foo[0] else foo[1]
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },

        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, { conditional: true });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([10]);

    assignments = Level3Runtime.encode(program, { conditional: false });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([20, 30]);
  });

  it("integrates correctly with get", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "integer", symbol: "x", width: 6 },
        { type: "integer", symbol: "y", width: 6 },
        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "y" },

        // if conditional then foo[x] else foo[y]
        { type: "boolean", symbol: "conditional" },
        { type: "push", symbol: "conditional" },
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "x" },
        { type: "get" },
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "y" },
        { type: "get" },

        { type: "if" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "conditional" },
        { type: "variable", symbol: "out" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      conditional: true,
      x: 0,
      y: 1
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([10]);

    assignments = Level3Runtime.encode(program, {
      conditional: false,
      x: 0,
      y: 1
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([20, 30]);

    assignments = Level3Runtime.encode(program, {
      conditional: false,
      x: 1,
      y: 0
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([10]);

    assignments = Level3Runtime.encode(program, {
      conditional: false,
      x: 1,
      y: 2
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([]);

    assignments = Level3Runtime.encode(program, {
      conditional: true,
      x: 2,
      y: 0
    });
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);
    result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.out).toEqual([]);
  });

  it("throws an error if the conditional is not a boolean", function () {
    expect(function () {
      Level3Compiler.compile({
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
      Level3Compiler.compile({
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
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "if" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if there is a different in type hierarchy", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "if" }
        ]
      });
    }).toThrow();
  });
});
