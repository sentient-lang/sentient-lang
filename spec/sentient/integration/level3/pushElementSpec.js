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

describe("Integration: 'pushElement'", function () {
  it("pushes an element onto an array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "collect", width: 1 },
        { type: "constant", value: 2 },
        { type: "pushElement" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
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

    expect(result).toEqual({ out: [1, 2] });
  });

  it("works with arrays of booleans", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "collect", width: 1 },
        { type: "constant", value: false },
        { type: "pushElement" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
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

    expect(result).toEqual({ out: [true, false] });
  });

  it("works with nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "constant", value: false },
        { type: "collect", width: 1 },
        { type: "pushElement" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
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

    expect(result).toEqual({ out: [[true], [false]] });
  });

  it("works if the array is empty", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "collect", width: 0 },
        { type: "constant", value: 123 },
        { type: "pushElement" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
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

    expect(result).toEqual({ out: [123] });
  });

  it("allows empty arrays to be pushed onto nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 0 },
        { type: "pushElement" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
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

    expect(result).toEqual({ out: [[1], []] });
  });

  it("throws an error on a type mismatch", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "constant", value: true },
          { type: "pushElement" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "constant", value: 123 },
          { type: "pushElement" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "pushElement" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "collect", width: 1 },
          { type: "constant", value: 1 },
          { type: "pushElement" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "collect", width: 0 },
          { type: "constant", value: 1 },
          { type: "pushElement" },
          { type: "constant", value: true },
          { type: "pushElement" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "collect", width: 0 },
          { type: "pushElement" }
        ]
      });
    }).toThrow();
  });
});
