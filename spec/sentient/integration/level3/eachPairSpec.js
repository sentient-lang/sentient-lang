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

describe("Integration: 'eachPair'", function () {
  it("sets the elements, index and isPresent per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "indexes", width: 3 },

        { type: "typedef", name: "boolean", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "presence", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn",
          args: ["e", "f", "i", "j", "p", "q"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "i" },
        { type: "push", symbol: "j" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "indexes" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "p" },
        { type: "push", symbol: "q" },
        { type: "collect", width: 2 },
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
        { type: "eachPair" },
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
      out: [10, 20, 30],
      elements: [[10, 20], [10, 30], [20, 30]],
      indexes: [[0, 1], [0, 2], [1, 2]],
      presence: [[true, true], [true, true], [true, true]]
    });
  });

  it("sets isPresent correctly", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "constant", value: 50 },
        { type: "collect", width: 3 },
        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "indexes", width: 3 },

        { type: "typedef", name: "boolean", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "presence", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn",
          args: ["e", "f", "i", "j", "p", "q"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "i" },
        { type: "push", symbol: "j" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "indexes" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "p" },
        { type: "push", symbol: "q" },
        { type: "collect", width: 2 },
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
        { type: "eachPair" },
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
      out: [10, 20],
      elements: [[10, 20], [10, -1], [20, -1]],
      indexes: [[0, 1], [0, 2], [1, 2]],
      presence: [[true, true], [true, false], [true, false]]
    });
  });

  it("supports calling eachPair with a four-argument function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "indexes", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn",
          args: ["e", "f", "i", "j"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "i" },
        { type: "push", symbol: "j" },
        { type: "collect", width: 2 },
        { type: "push", symbol: "indexes" },
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
        { type: "eachPair" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
        { type: "variable", symbol: "elements" },
        { type: "variable", symbol: "indexes" }
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
      out: [10, 20, 30],
      elements: [[10, 20], [10, 30], [20, 30]],
      indexes: [[0, 1], [0, 2], [1, 2]]
    });
  });

  it("supports calling eachPair with a two-argument function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e", "f"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 2 },
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
        { type: "eachPair" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
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

    expect(result).toEqual({
      out: [10, 20, 30],
      elements: [[10, 20], [10, 30], [20, 30]]
    });
  });

  it("supports calling each with nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 1 },
        { type: "typedef", name: "array", width: 1 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "counter" },

        { type: "define", name: "myFn", args: ["e", "f"], dynamic: true },

        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 2 },
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
        { type: "eachPair" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
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

    expect(result).toEqual({
      out: [[[10]], [[20]], [[30]]],
      elements: [[[[10]], [[20]]], [[[10]], [[30]]], [[[20]], [[30]]]]
    });
  });
});
