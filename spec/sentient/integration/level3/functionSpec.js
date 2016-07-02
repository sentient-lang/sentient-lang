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

    var result = Machine.run(program, assignments)[0];

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

    var result = Machine.run(program, assignments)[0];

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

    var result = Machine.run(program, assignments)[0];

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
        { type: "subtract" },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "y" },
        { type: "add" },
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

    var result = Machine.run(program, assignments)[0];

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
        { type: "pop", symbol: "functionX" },

        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "functionX" }
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

    expect(result).toEqual({ x: 5, functionX: 10 });
  });

  it("does not affect array elements outside the function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "pop", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "arr" },

        { type: "define", name: "foo", args: [] },
        { type: "constant", value: 10 },
        { type: "pop", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "arr" },
        { type: "push", symbol: "arr" },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
        { type: "pop", symbol: "fooArr" },

        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "arr" },
        { type: "variable", symbol: "fooArr" }
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

    expect(result).toEqual({ x: 5, arr: [5], fooArr: [10] });
  });

  it("does not bleed local variables into the caller", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [] },
          { type: "constant", value: 10 },
          { type: "pop", symbol: "x" },
          { type: "push", symbol: "x" },
          { type: "return", width: 1 },

          { type: "call", name: "foo", width: 0 },

          // x is not declared in this context so this should error.
          { type: "push", symbol: "x" }
        ]
      });
    }).toThrow();
  });

  it("allows private functions to be defined inside functions", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "foo", args: [] },
        { type: "define", name: "bar", args: [] },
        { type: "constant", value: 10 },
        { type: "return", width: 1 },
        { type: "call", name: "bar", width: 0 },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
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

    expect(result).toEqual({ a: 10 });
  });

  it("does not allow private functions to be called outside", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [] },
          { type: "define", name: "bar", args: [] },
          { type: "return", width: 0 },
          { type: "return", width: 0 },

          { type: "call", name: "bar", width: 0 }
        ]
      });
    }).toThrow();
  });

  it("can call functions that are defined in the ancestry", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "foo", args: [] },
        { type: "define", name: "bar", args: [] },
        { type: "constant", value: 10 },
        { type: "return", width: 1 },
        { type: "define", name: "baz", args: [] },
        { type: "call", name: "bar", width: 0 },
        { type: "return", width: 1 },
        { type: "call", name: "baz", width: 0 },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
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

    expect(result).toEqual({ a: 10 });
  });

  it("allows function definition shadowing", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "foo", args: [] },
        { type: "constant", value: 10 },
        { type: "return", width: 1 },

        { type: "define", name: "bar", args: [] },
        { type: "define", name: "foo", args: [] },
        { type: "constant", value: 20 },
        { type: "return", width: 1 },
        { type: "call", name: "foo", width: 0 },
        { type: "return", width: 1 },

        { type: "call", name: "foo", width: 0 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "call", name: "bar", width: 0 },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "call", name: "foo", width: 0 },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" }
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

    expect(result).toEqual({ a: 10, b: 20, c: 10 });
  });

  it("does not allow immutable function definition shadowing", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [], immutable: true },
          { type: "constant", value: 10 },
          { type: "return", width: 1 },

          { type: "define", name: "bar", args: [] },
          { type: "define", name: "foo", args: [] },
          { type: "return", width: 0 },
          { type: "return", width: 0 },

          { type: "call", name: "bar", width: 0 }
        ]
      });
    }).toThrow();
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

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ quad: 40 });
  });

  it("tracks conditional nils correctly", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "get_1", args: ["arr"] },
        { type: "push", symbol: "arr" },
        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
        { type: "swap" },
        { type: "return", width: 2 },

        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },

        { type: "call", name: "get_1", width: 1 },

        { type: "pop", symbol: "aPresent" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "aPresent" },
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

    expect(result).toEqual({ a: -1, aPresent: false });
  });

  it("does not bleed array elements into the caller", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 123 },
        { type: "pop", symbol: "foo" },
        { type: "push", symbol: "foo" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "arr" },

        { type: "define", name: "bar", args: ["x"] },
        { type: "constant", value: 123 },
        { type: "pop", symbol: "foo" },
        { type: "push", symbol: "x" },
        { type: "return", width: 1 },

        { type: "push", symbol: "arr" },
        { type: "call", name: "bar", width: 1 },
        { type: "variable", symbol: "foo" }
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

    expect(result).toEqual({ foo: 123 });
  });

  it("does not bleed nested array elements into the caller", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 123 },
        { type: "pop", symbol: "foo" },
        { type: "push", symbol: "foo" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "bar" },
        { type: "push", symbol: "bar" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "arr" },

        { type: "define", name: "baz", args: ["x"] },
        { type: "constant", value: 123 },
        { type: "pop", symbol: "foo" },
        { type: "push", symbol: "x" },
        { type: "return", width: 1 },

        { type: "push", symbol: "arr" },
        { type: "call", name: "baz", width: 1 },
        { type: "variable", symbol: "foo" }
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

    expect(result).toEqual({ foo: 123 });
  });

  it("passes primitive types by value", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 123 },
        { type: "pop", symbol: "x" },
        { type: "constant", value: true },
        { type: "pop", symbol: "y" },

        { type: "define", name: "foo", args: ["bar"] },
        { type: "push", symbol: "bar" },
        { type: "return", width: 1 },

        { type: "push", symbol: "x" },
        { type: "call", name: "foo", width: 1 },
        { type: "pop", symbol: "outX" },

        { type: "push", symbol: "y" },
        { type: "call", name: "foo", width: 1 },
        { type: "pop", symbol: "outY" },

        { type: "constant", value: 456 },
        { type: "pop", symbol: "x" },
        { type: "constant", value: false },
        { type: "pop", symbol: "y" },

        { type: "variable", symbol: "outX" },
        { type: "variable", symbol: "outY" }
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

    expect(result).toEqual({ outX: 123, outY: true });
  });

  it("passes arbitrarily nested arrays by value (deep copy)", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 123 },
        { type: "pop", symbol: "x" },
        { type: "push", symbol: "x" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "y" },
        { type: "push", symbol: "y" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "z" },

        { type: "define", name: "foo", args: ["bar"] },
        { type: "push", symbol: "bar" },
        { type: "return", width: 1 },

        { type: "push", symbol: "z" },
        { type: "call", name: "foo", width: 1 },
        { type: "pop", symbol: "out" },

        { type: "constant", value: 456 },
        { type: "pop", symbol: "x" },
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

    expect(result).toEqual({ out: [[123]] });
  });

  describe("dynamically scoped functions", function () {
    it("allows functions to be called with a dynamic scope", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "x_add_y", args: ["x"], dynamic: true },
          { type: "push", symbol: "x" },
          { type: "push", symbol: "y" },
          { type: "add" },
          { type: "return", width: 1 },

          { type: "constant", value: 10 },
          { type: "pop", symbol: "y" },
          { type: "constant", value: 20 },
          { type: "call", name: "x_add_y", width: 1 },

          { type: "pop", symbol: "total" },
          { type: "variable", symbol: "total" }
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

      expect(result).toEqual({ total: 30 });
    });

    it("does not bleed local variables into the caller", function () {
      expect(function () {
        Level3Compiler.compile({
          instructions: [
            { type: "define", name: "foo", args: [], dynamic: true },
            { type: "constant", value: 10 },
            { type: "pop", symbol: "x" },
            { type: "return", width: 0 },

            { type: "call", name: "foo", width: 0 },

            // x is not declared in this context so this should error.
            { type: "push", symbol: "x" }
          ]
        });
      }).toThrow();
    });

    it("allows variables outside of the closure to be mutated", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "pop", symbol: "x" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 456 },
          { type: "pop", symbol: "x" },
          { type: "return", width: 0 },

          { type: "call", name: "foo", width: 0 },

          { type: "variable", symbol: "x" }
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

      expect(result).toEqual({ x: 456 });
    });

    it("does not clobber caller variables with local arguments", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "pop", symbol: "x" },

          { type: "define", name: "foo", args: ["x"], dynamic: true },
          { type: "constant", value: 456 },
          { type: "pop", symbol: "x" },
          { type: "return", width: 0 },

          { type: "constant", value: 789 },
          { type: "call", name: "foo", width: 1 },

          { type: "variable", symbol: "x" }
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

      expect(result).toEqual({ x: 123 });
    });

    it("allows dynamic function nesting", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 20 },
          { type: "pop", symbol: "y" },
          { type: "call", name: "bar", width: 0 },
          { type: "return", width: 1 },

          { type: "define", name: "bar", args: [], dynamic: true },
          { type: "push", symbol: "x" },
          { type: "push", symbol: "y" },
          { type: "add" },
          { type: "return", width: 1 },

          { type: "constant", value: 10 },
          { type: "pop", symbol: "x" },
          { type: "call", name: "foo", width: 0 },

          { type: "pop", symbol: "total" },
          { type: "variable", symbol: "total" }
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

      expect(result).toEqual({ total: 30 });
    });

    it("inherits scope from the nearest ancestor", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: ["x"], dynamic: true },
          { type: "constant", value: 123 },
          { type: "pop", symbol: "x" },
          { type: "call", name: "bar", width: 0 },
          { type: "return", width: 1 },

          { type: "define", name: "bar", args: [], dynamic: true },
          { type: "push", symbol: "x" },
          { type: "return", width: 1 },

          { type: "constant", value: 456 },
          { type: "pop", symbol: "x" },
          { type: "push", symbol: "x" },
          { type: "call", name: "foo", width: 1 },

          { type: "pop", symbol: "foo" },
          { type: "variable", symbol: "foo" }
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

      expect(result).toEqual({ foo: 123 });
    });

    it("inherits scope from locally scoped functions", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [] },
          { type: "constant", value: 123 },
          { type: "pop", symbol: "x" },
          { type: "call", name: "bar", width: 0 },
          { type: "return", width: 1 },

          { type: "define", name: "bar", args: [], dynamic: true },
          { type: "push", symbol: "x" },
          { type: "return", width: 1 },

          { type: "call", name: "foo", width: 0 },

          { type: "pop", symbol: "foo" },
          { type: "variable", symbol: "foo" }
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

      expect(result).toEqual({ foo: 123 });
    });

    it("returns arrays by value; cannot be subsequently mutated", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "pop", symbol: "a" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "push", symbol: "a" },
          { type: "collect", width: 1 },
          { type: "return", width: 1 },

          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "arr" },

          { type: "constant", value: 456 },
          { type: "pop", symbol: "a" },

          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ arr: [123] });
    });

    it("passes and returns by value when shadowing variables", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "pop", symbol: "a" },

          { type: "define", name: "foo", args: ["a"], dynamic: true },
          { type: "push", symbol: "a" },
          { type: "collect", width: 1 },
          { type: "return", width: 1 },

          { type: "constant", value: 456 },
          { type: "call", name: "foo", width: 1 },

          { type: "pop", symbol: "arr" },

          { type: "variable", symbol: "a" },
          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ a: 123, arr: [456] });
    });

    it("does not inherit ancestors of a locally scoped function", function () {
      expect(function () {
        Level3Compiler.compile({
          instructions: [
            { type: "define", name: "foo", args: [] },
            { type: "call", name: "bar", width: 0 },
            { type: "return", width: 1 },

            { type: "define", name: "bar", args: [], dynamic: true },
            { type: "push", symbol: "x" },
            { type: "return", width: 1 },

            // x is not visible in 'bar' because 'foo' is not dynamic
            { type: "constant", value: 123 },
            { type: "pop", symbol: "x" },
            { type: "call", name: "foo", width: 0 }
          ]
        });
      }).toThrow();
    });

    it("copies context variables by value at call time", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "pop", symbol: "a" },
          { type: "push", symbol: "a" },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "b" },
          { type: "push", symbol: "b" },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "c" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "push", symbol: "c" },
          { type: "return", width: 1 },

          { type: "constant", value: 456 },
          { type: "pop", symbol: "a" },
          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "x" },

          { type: "constant", value: 789 },
          { type: "pop", symbol: "a" },
          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "y" },

          { type: "variable", symbol: "x" },
          { type: "variable", symbol: "y" }
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

      expect(result).toEqual({ x: [[456]], y: [[789]] });
    });

    it("assigns correct element values for a complicated case", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "arr" },
          { type: "constant", value: 5 },
          { type: "pop", symbol: "x" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 15 },
          { type: "pop", symbol: "y" },
          { type: "push", symbol: "x" },
          { type: "push", symbol: "y" },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "arr" },
          { type: "constant", value: 20 },
          { type: "pop", symbol: "y" },
          { type: "return", width: 0 },

          { type: "constant", value: 10 },
          { type: "pop", symbol: "x" },

          { type: "constant", value: 25 },
          { type: "pop", symbol: "y" },

          { type: "call", name: "foo", width: 0 },

          { type: "constant", value: 30 },
          { type: "pop", symbol: "x" },

          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ arr: [10, 20] });
    });

    it("inherits conditional nils from the context", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "push", symbol: "arr" },
          { type: "constant", value: 1 },
          { type: "get", checkBounds: true },
          { type: "swap" },
          { type: "return", width: 2 },

          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "pop", symbol: "arr" },

          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "aPresent" },
          { type: "pop", symbol: "a" },

          { type: "variable", symbol: "aPresent" },
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

      expect(result).toEqual({ a: -1, aPresent: false });
    });

    it("copies conditional nils to arguments of the function", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: ["bar"], dynamic: true },
          { type: "push", symbol: "bar" },
          { type: "constant", value: 1 },
          { type: "get", checkBounds: true },
          { type: "swap" },
          { type: "return", width: 2 },

          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "pop", symbol: "arr" },

          { type: "push", symbol: "arr" },
          { type: "call", name: "foo", width: 1 },

          { type: "pop", symbol: "aPresent" },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "aPresent" },
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

      expect(result).toEqual({ a: -1, aPresent: false });
    });

    it("does not inherit conditional nils for shadowed arguments", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: ["arr"], dynamic: true },
          { type: "push", symbol: "arr" },
          { type: "constant", value: 1 },
          { type: "get", checkBounds: true },
          { type: "swap" },
          { type: "return", width: 2 },

          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "pop", symbol: "arr" },

          { type: "constant", value: 1 },
          { type: "constant", value: 2 },
          { type: "collect", width: 2 },

          { type: "call", name: "foo", width: 1 },
          { type: "pop", symbol: "aPresent" },
          { type: "pop", symbol: "a" },

          { type: "variable", symbol: "aPresent" },
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

      expect(result).toEqual({ a: 2, aPresent: true });
    });

    it("inherits nested conditional nils from the context", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "push", symbol: "arr" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "constant", value: 1 },
          { type: "get", checkBounds: true },
          { type: "swap" },
          { type: "return", width: 2 },

          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "arr" },

          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "aPresent" },
          { type: "pop", symbol: "a" },

          { type: "variable", symbol: "aPresent" },
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

      expect(result).toEqual({ a: -1, aPresent: false });
    });

    it("copies conditional nils back to the context", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "return", width: 1 },

          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "arr" },
          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ arr: [10] });
    });

    it("copies conditional nils back for context variables", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 123 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "arr" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "pop", symbol: "arr" },
          { type: "return", width: 0 },

          { type: "call", name: "foo", width: 0 },
          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ arr: [10] });
    });

    it("overwrites existing conditionals for context variables", function () {
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
          { type: "pop", symbol: "arr" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 1 },
          { type: "constant", value: 2 },
          { type: "constant", value: 3 },
          { type: "collect", width: 3 },
          { type: "pop", symbol: "arr" },
          { type: "return", width: 0 },

          { type: "call", name: "foo", width: 0 },
          { type: "variable", symbol: "arr" }
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

      expect(result).toEqual({ arr: [1, 2, 3] });
    });

    it("copies conditional nils in and out of dynamic functions", function () {
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
          { type: "pop", symbol: "arr" },

          { type: "define", name: "foo", args: [], dynamic: true },
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "constant", value: 50 },
          { type: "constant", value: 60 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },
          { type: "push", symbol: "x" },
          { type: "fetch" },
          { type: "pop", symbol: "bar" },
          { type: "push", symbol: "arr" },
          { type: "push", symbol: "bar" },
          { type: "collect", width: 2 },
          { type: "return", width: 1 },

          { type: "constant", value: 0 },
          { type: "pop", symbol: "x" },
          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "a" },

          { type: "constant", value: 1 },
          { type: "pop", symbol: "x" },
          { type: "call", name: "foo", width: 0 },
          { type: "pop", symbol: "b" },

          { type: "variable", symbol: "a" },
          { type: "variable", symbol: "b" }
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

      expect(result).toEqual({
        a: [[10], [40]],
        b: [[10], [50, 60]]
      });
    });
  });

  describe("passing functions as arguments", function () {
    it("allows functions to be passed to other functions", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: ["*func", "bar"] },
          { type: "push", symbol: "bar" },
          { type: "call", name: "func", width: 1 },
          { type: "return", width: 1 },

          { type: "define", name: "double", args: ["x"] },
          { type: "push", symbol: "x" },
          { type: "constant", value: 2 },
          { type: "multiply" },
          { type: "return", width: 1 },

          { type: "define", name: "triple", args: ["x"] },
          { type: "push", symbol: "x" },
          { type: "constant", value: 3 },
          { type: "multiply" },
          { type: "return", width: 1 },

          { type: "pointer", name: "double" },
          { type: "constant", value: 123 },
          { type: "call", name: "foo", width: 2 },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" },

          { type: "pointer", name: "triple" },
          { type: "constant", value: 123 },
          { type: "call", name: "foo", width: 2 },
          { type: "pop", symbol: "b" },
          { type: "variable", symbol: "b" }
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

      expect(result).toEqual({ a: 246, b: 369 });
    });

    it("uses the latest definition of the function", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "define", name: "foo", args: ["*func", "bar"] },
          { type: "push", symbol: "bar" },
          { type: "call", name: "func", width: 1 },
          { type: "return", width: 1 },

          { type: "define", name: "someFunc", args: ["x"] },
          { type: "push", symbol: "x" },
          { type: "return", width: 1 },

          { type: "pointer", name: "someFunc" },
          { type: "constant", value: 123 },
          { type: "call", name: "foo", width: 2 },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" },

          { type: "define", name: "someFunc", args: ["x"] },
          { type: "constant", value: 999 },
          { type: "return", width: 1 },

          { type: "pointer", name: "someFunc" },
          { type: "constant", value: 123 },
          { type: "call", name: "foo", width: 2 },
          { type: "pop", symbol: "b" },
          { type: "variable", symbol: "b" }
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

      expect(result).toEqual({ a: 123, b: 999 });
    });
  });

  describe("recursive function call", function () {
    it("throws an error", function () {
      expect(function () {
        Level3Compiler.compile({
          instructions: [
            { type: "define", name: "foo", args: [] },
            { type: "call", name: "bar", width: 0 },
            { type: "return", width: 0 },

            { type: "define", name: "bar", args: [] },
            { type: "call", name: "foo", width: 0 },
            { type: "return", width: 0 },

            { type: "call", name: "foo", width: 0 }
          ]
        });
      }).toThrow();
    });
  });
});
