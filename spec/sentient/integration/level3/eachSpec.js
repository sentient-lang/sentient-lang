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

describe("Integration: 'each'", function () {
  it("sets the elements (and index) per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "define", name: "myFn", args: ["e", "i", "p"], dynamic: true },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "i" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },
        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "each" },
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

    expect(result).toEqual({ out: [10, 20, 30], elements: [10, 20, 30] });
  });

  it("sets isPresent (and index) per iteration", function () {
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
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "boolean" },
        { type: "array", symbol: "presence", width: 2 },

        { type: "define", name: "myFn", args: ["e", "i", "p"], dynamic: true },
        { type: "push", symbol: "p" },
        { type: "push", symbol: "presence" },
        { type: "push", symbol: "i" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },
        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "each" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
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

    expect(result).toEqual({ out: [10], presence: [true, false] });
  });

  it("supports calling each with a two-argument function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "elements", width: 3 },

        { type: "define", name: "myFn", args: ["e", "i"], dynamic: true },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "elements" },
        { type: "push", symbol: "i" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },
        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "each" },
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

    expect(result).toEqual({ out: [10, 20, 30], elements: [10, 20, 30] });
  });

  it("supports calling each with a one-argument function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "myArray" },

        { type: "integer", symbol: "x", width: 6 },

        { type: "define", name: "myFn", args: ["e"], dynamic: true },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "x" },
        { type: "equal" },
        { type: "invariant" },
        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "each" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
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

    expect(result).toEqual({ out: [10], x: 10 });
  });

  it("supports calling each with nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "myArray" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 1 },
        { type: "array", symbol: "x", width: 1 },

        { type: "define", name: "myFn", args: ["e"], dynamic: true },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "x" },
        { type: "equal" },
        { type: "invariant" },
        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "each" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },
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

    expect(result).toEqual({ out: [[[10]]], x: [[10]] });
  });
});
