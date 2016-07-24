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

describe("Integration: 'eachSlice'", function () {
  it("sets the elements, index and isPresent per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "constant", value: 50 },
        { type: "collect", width: 5 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "indexes", width: 3 },

        { type: "typedef", name: "boolean", width: 8 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "presence", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e", "i", "p"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "i" },
        { type: "push", symbol: "indexes" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "p" },
        { type: "push", symbol: "presence" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachSlice", width: 2 },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
        { type: "variable", symbol: "elements" },
        { type: "variable", symbol: "indexes" },
        { type: "variable", symbol: "presence" }
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
      out: [10, 20, 30, 40, 50],
      elements: [[10, 20], [30, 40], [50, -1]],
      indexes: [[0, 1], [2, 3], [4, -1]],
      presence: [[true, true], [true, true], [true, false]]
    });
  });

  it("can iterate a slice of 3 elements at a time", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "constant", value: 50 },
        { type: "collect", width: 5 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 3 },
        { type: "array", symbol: "elements", width: 2 },

        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 3 },
        { type: "array", symbol: "indexes", width: 2 },

        { type: "typedef", name: "boolean", width: 8 },
        { type: "typedef", name: "array", width: 3 },
        { type: "array", symbol: "presence", width: 2 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e", "i", "p"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "i" },
        { type: "push", symbol: "indexes" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "p" },
        { type: "push", symbol: "presence" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachSlice", width: 3 },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
        { type: "variable", symbol: "elements" },
        { type: "variable", symbol: "indexes" },
        { type: "variable", symbol: "presence" }
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
      out: [10, 20, 30, 40, 50],
      elements: [[10, 20, 30], [40, 50, -1]],
      indexes: [[0, 1, 2], [3, 4, -1]],
      presence: [[true, true, true], [true, true, false]]
    });
  });

  it("sets presence array correctly", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 3 },
        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "myArray" },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "typedef", name: "boolean" },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "out", width: 2 },

        { type: "define", name: "myFn", args: ["e", "i", "presence"],
          dynamic: true },

        { type: "push", symbol: "presence" },
        { type: "push", symbol: "out" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachSlice", width: 2 },

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

    expect(result).toEqual({ out: [[true, false], [false, false]] });
  });

  it("sets 'false' as the boolean element fallback", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: true },
        { type: "constant", value: true },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "boolean" },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 2 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachSlice", width: 2 },

        { type: "variable", symbol: "elements" }
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

    expect(result).toEqual({ elements: [[true, true], [true, false]] });
  });

  it("works for nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "collect", width: 1 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 1 },
        { type: "typedef", name: "array", width: 1 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachSlice", width: 1 },

        { type: "variable", symbol: "elements" }
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

    expect(result).toEqual({ elements: [[[10]], [[20]], [[30]]] });
  });

  it("throws an error if the width is undefined", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "myArray" },

          { type: "define", name: "myFn", args: ["elements"], dynamic: true },
          { type: "return", width: 0 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "myFn" },
          { type: "eachSlice" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the width is less than 1", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "myArray" },

          { type: "define", name: "myFn", args: ["elements"], dynamic: true },
          { type: "return", width: 0 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "myFn" },
          { type: "eachSlice", width: 0 }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the width is greater than the array", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "myArray" },

          { type: "define", name: "myFn", args: ["elements"], dynamic: true },
          { type: "return", width: 0 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "myFn" },
          { type: "eachSlice", width: 3 }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the symbol is not an array", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "define", name: "myFn", args: ["elements"], dynamic: true },
          { type: "return", width: 0 },

          { type: "constant", value: 123 },
          { type: "pointer", name: "myFn" },
          { type: "eachSlice", width: 3 }
        ]
      });
    }).toThrow();
  });
});
