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

describe("Integration: defining and calling functions", function () {
  it("can call a simple function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "double", args: ["x"] },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "constant", value: 123 },
        { type: "call", name: "double", width: 1 },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "out" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ out: 246 });
  });

  it("can call a function with an array argument", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "dig_x_y", args: ["arr", "x", "y"] },
        { type: "push", symbol: "arr" },
        { type: "push", symbol: "x" },
        { type: "fetch" },
        { type: "push", symbol: "y" },
        { type: "fetch" },
        { type: "return", width: 1 },

        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "constant", value: 0 },
        { type: "call", name: "dig_x_y", width: 3 },
        { type: "pop", symbol: "first" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "constant", value: 0 },
        { type: "call", name: "dig_x_y", width: 3 },
        { type: "pop", symbol: "second" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "constant", value: 1 },
        { type: "call", name: "dig_x_y", width: 3 },
        { type: "pop", symbol: "third" },

        { type: "variable", symbol: "first" },
        { type: "variable", symbol: "second" },
        { type: "variable", symbol: "third" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ first: 10, second: 20, third: 30 });
  });

  it("can call a function with an array return value", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "arr", args: [] },
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "return", width: 1 },

        { type: "call", name: "arr", width: 0 },
        { type: "pop", symbol: "array" },
        { type: "variable", symbol: "array" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ array: [[10], [20, 30]] });
  });

  it("can call a function with multiple arguments and returns", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "add_sub", args: ["x", "y"] },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "y" },
        { type: "add" },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "y" },
        { type: "subtract" },
        { type: "return", width: 2 },

        { type: "constant", value: 10 },
        { type: "constant", value: 3 },
        { type: "call", name: "add_sub", width: 2 },
        { type: "pop", symbol: "added" },
        { type: "pop", symbol: "subtracted" },
        { type: "variable", symbol: "added" },
        { type: "variable", symbol: "subtracted" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ added: 13, subtracted: 7 });
  });

  it("does not affect variables outside the function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "pop", symbol: "x" },

        { type: "define", name: "foo", args: [] },
        { type: "constant", value: 10 },
        { type: "pop", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
        { type: "pop", symbol: "function_x" },

        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "function_x" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ x: 5, function_x: 10 });
  });

  it("allows functions to be defined inside functions", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "foo", args: [] },
        { type: "constant", value: 5 },
        { type: "define", name: "bar", args: [] },
        { type: "constant", value: 10 },
        { type: "define", name: "baz", args: [] },
        { type: "constant", value: 15 },
        { type: "return", width: 1 },
        { type: "return", width: 1 },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
        { type: "pop", symbol: "a" },

        { type: "call", name: "bar", width: 0 },
        { type: "pop", symbol: "b" },

        { type: "call", name: "baz", width: 0 },
        { type: "pop", symbol: "c" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: 5, b: 10, c: 15 });
  });

  it("allows functions to be called inside functions", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "double", args: ["x"] },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "define", name: "quadruple", args: ["x"] },
        { type: "push", symbol: "x" },
        { type: "call", name: "double", width: 1 },
        { type: "push", symbol: "x" },
        { type: "call", name: "double", width: 1 },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "constant", value: 10 },
        { type: "call", name: "quadruple", width: 1 },
        { type: "pop", symbol: "quad" },
        { type: "variable", symbol: "quad" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ quad: 40 });
  });
});
