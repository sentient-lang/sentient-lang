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

describe("Integration: 'eachCons'", function () {
  it("sets the elements, index and isPresent per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 4 },
        { type: "pop", symbol: "myArray" },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "aTotal" },
        { type: "constant", value: 0 },
        { type: "pop", symbol: "bTotal" },

        { type: "define", name: "myFn", args: ["elements"], dynamic: true },

        { type: "push", symbol: "elements" },
        { type: "fetchIndex", index: 0 },
        { type: "push", symbol: "aTotal" },
        { type: "add" },
        { type: "pop", symbol: "aTotal" },

        { type: "push", symbol: "elements" },
        { type: "fetchIndex", index: 1 },
        { type: "push", symbol: "bTotal" },
        { type: "add" },
        { type: "pop", symbol: "bTotal" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachCons", width: 2 },

        { type: "variable", symbol: "aTotal" },
        { type: "variable", symbol: "bTotal" }
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

    // [10, 20], [20, 30], [30, 40]
    expect(result).toEqual({ aTotal: 60, bTotal: 90 });
  });

  it("can iterate over 3 consecutive elements at a time", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 4 },
        { type: "pop", symbol: "myArray" },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "aTotal" },
        { type: "constant", value: 0 },
        { type: "pop", symbol: "bTotal" },
        { type: "constant", value: 0 },
        { type: "pop", symbol: "cTotal" },

        { type: "define", name: "myFn", args: ["elements"], dynamic: true },

        { type: "push", symbol: "elements" },
        { type: "fetchIndex", index: 0 },
        { type: "push", symbol: "aTotal" },
        { type: "add" },
        { type: "pop", symbol: "aTotal" },

        { type: "push", symbol: "elements" },
        { type: "fetchIndex", index: 1 },
        { type: "push", symbol: "bTotal" },
        { type: "add" },
        { type: "pop", symbol: "bTotal" },

        { type: "push", symbol: "elements" },
        { type: "fetchIndex", index: 2 },
        { type: "push", symbol: "cTotal" },
        { type: "add" },
        { type: "pop", symbol: "cTotal" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachCons", width: 3 },

        { type: "variable", symbol: "aTotal" },
        { type: "variable", symbol: "bTotal" },
        { type: "variable", symbol: "cTotal" }
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

    // [10, 20, 30], [20, 30, 40]
    expect(result).toEqual({ aTotal: 30, bTotal: 50, cTotal: 70 });
  });

  it("can pass an array of indexes to the function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 4 },
        { type: "pop", symbol: "myArray" },

        { type: "constant", value: 0 },
        { type: "pop", symbol: "aIndexTotal" },
        { type: "constant", value: 0 },
        { type: "pop", symbol: "bIndexTotal" },

        { type: "define", name: "myFn", args: ["elements", "indexArray"],
          dynamic: true },

        { type: "push", symbol: "indexArray" },
        { type: "fetchIndex", index: 0 },
        { type: "push", symbol: "aIndexTotal" },
        { type: "add" },
        { type: "pop", symbol: "aIndexTotal" },

        { type: "push", symbol: "indexArray" },
        { type: "fetchIndex", index: 1 },
        { type: "push", symbol: "bIndexTotal" },
        { type: "add" },
        { type: "pop", symbol: "bIndexTotal" },

        { type: "return", width: 0 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "eachCons", width: 2 },

        { type: "variable", symbol: "aIndexTotal" },
        { type: "variable", symbol: "bIndexTotal" }
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

    // [0, 1], [1, 2], [2, 3]
    expect(result).toEqual({ aIndexTotal: 3, bIndexTotal: 6 });
  });

  it("sets isPresentArray correctly", function () {
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
        { type: "array", symbol: "out", width: 4 },

        { type: "define", name: "myFn", args: ["e", "i", "isPresentArray"],
          dynamic: true },

        { type: "push", symbol: "isPresentArray" },
        { type: "fetchIndex", index: 0 },
        { type: "push", symbol: "out" },
        { type: "push", symbol: "counter" },
        { type: "fetch" },
        { type: "equal" },
        { type: "invariant" },

        { type: "push", symbol: "counter" },
        { type: "constant", value: 1 },
        { type: "add" },
        { type: "pop", symbol: "counter" },

        { type: "push", symbol: "isPresentArray" },
        { type: "fetchIndex", index: 1 },
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
        { type: "eachCons", width: 2 },

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

    // [10, nil], [nil, nil]
    expect(result).toEqual({ out: [true, false, false, false] });
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
          { type: "eachCons" }
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
          { type: "eachCons", width: 0 }
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
          { type: "eachCons", width: 3 }
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
          { type: "eachCons", width: 3 }
        ]
      });
    }).toThrow();
  });
});
