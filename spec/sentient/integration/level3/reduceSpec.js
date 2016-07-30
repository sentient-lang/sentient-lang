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

describe("Integration: 'reduce'", function () {
  it("reduces over an array of integers", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "n"], dynamic: true },
        { type: "push", symbol: "acc" },
        { type: "push", symbol: "n" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 0 },
        { type: "pointer", name: "sum" },
        { type: "reduce", initial: true },
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

    expect(result).toEqual({ out: 60 });
  });

  it("reduces over an array of booleans", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "constant", value: true },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "b"], dynamic: true },

        { type: "push", symbol: "b" },
        { type: "constant", value: 10 },
        { type: "constant", value: 1 },
        { type: "if" },

        { type: "push", symbol: "acc" },
        { type: "add" },

        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 0 },
        { type: "pointer", name: "sum" },
        { type: "reduce", initial: true },
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

    // 10 + 1 + 10
    expect(result).toEqual({ out: 21 });
  });

  it("can pass the element's index to the function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "n", "i"], dynamic: true },
        { type: "push", symbol: "n" },
        { type: "push", symbol: "i" },
        { type: "multiply" },

        { type: "push", symbol: "acc" },
        { type: "add" },

        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 0 },
        { type: "pointer", name: "sum" },
        { type: "reduce", initial: true },
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

    // 0 * 10, 1 * 20, 2 * 30 = 80
    expect(result).toEqual({ out: 80 });
  });

  it("can pass the element's isPresent to the function", function () {
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

        { type: "define", name: "sum", args: ["acc", "n", "i", "p"],
          dynamic: true },

        { type: "push", symbol: "p" },
        { type: "push", symbol: "n" },
        { type: "constant", value: 1 },
        { type: "if" },

        { type: "push", symbol: "acc" },
        { type: "add" },

        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 0 },
        { type: "pointer", name: "sum" },
        { type: "reduce", initial: true },
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

    // 10 + 20 + 1 (present=false)
    expect(result).toEqual({ out: 31 });
  });

  it("uses the first element with no initial value", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "n"], dynamic: true },
        { type: "push", symbol: "acc" },
        { type: "push", symbol: "n" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "sum" },
        { type: "reduce" },
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

    expect(result).toEqual({ out: 60 });
  });

  it("works for an array length of one and no initial value", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "n"], dynamic: true },
        { type: "push", symbol: "acc" },
        { type: "push", symbol: "n" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "sum" },
        { type: "reduce" },
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

    expect(result).toEqual({ out: 10 });
  });

  it("supports calling reduce with nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "sum", args: ["acc", "n"] },
        { type: "push", symbol: "acc" },
        { type: "push", symbol: "n" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "define", name: "sumArr", args: ["acc", "arr"] },
        { type: "push", symbol: "arr" },
        { type: "pointer", name: "sum" },
        { type: "reduce" },
        { type: "push", symbol: "acc" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 0 },
        { type: "pointer", name: "sumArr" },
        { type: "reduce", initial: true },
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

    expect(result).toEqual({ out: 100 });
  });

  it("throws an error if the first element is conditionally nil", function () {
    expect(function () {
      Level3Compiler.compile({
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

          { type: "define", name: "sum", args: ["acc", "n"], dynamic: true },
          { type: "push", symbol: "acc" },
          { type: "push", symbol: "n" },
          { type: "add" },
          { type: "return", width: 1 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "sum" },
          { type: "reduce" },
          { type: "pop", symbol: "out" },

          { type: "variable", symbol: "out" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if reducing a non-array", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "pop", symbol: "nonArray" },

          { type: "define", name: "sum", args: ["acc", "n"], dynamic: true },
          { type: "push", symbol: "acc" },
          { type: "push", symbol: "n" },
          { type: "add" },
          { type: "return", width: 1 },

          { type: "push", symbol: "nonArray" },
          { type: "pointer", name: "sum" },
          { type: "reduce" }
        ]
      });
    }).toThrow();
  });

  it("throws if function takes fewer than two arguments", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "myArray" },

          { type: "define", name: "myFn", args: ["acc"], dynamic: true },
          { type: "push", symbol: "acc" },
          { type: "return", width: 1 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "myFn" },
          { type: "reduce" }
        ]
      });
    }).toThrow();
  });

  it("throws if function takes more than four arguments", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "myArray" },

          { type: "define", name: "myFn", args: ["a", "b", "c", "d", "e"] },
          { type: "push", symbol: "a" },
          { type: "return", width: 1 },

          { type: "push", symbol: "myArray" },
          { type: "pointer", name: "myFn" },
          { type: "reduce" }
        ]
      });
    }).toThrow();
  });
});
