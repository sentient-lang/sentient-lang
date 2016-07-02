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

describe("Integration: 'map'", function () {
  it("sets the elements (and index) per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "myFn", args: ["element", "index"] },
        { type: "push", symbol: "element" },
        { type: "constant", value: 2 },
        { type: "multiply" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "map" },
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

    expect(result).toEqual({ out: [20, 40, 60] });
  });

  it("sets the element index per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "myFn", args: ["element", "index"] },
        { type: "push", symbol: "element" },
        { type: "push", symbol: "index" },
        { type: "add" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "map" },
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

    expect(result).toEqual({ out: [10, 21, 32] });
  });

  it("preserves nil conditions from the original array", function () {
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

        { type: "define", name: "myFn", args: ["element", "index"] },
        { type: "push", symbol: "element" },
        { type: "constant", value: 2 },
        { type: "multiply" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "myFn" },
        { type: "map" },
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

    expect(result).toEqual({ out: [20] });
  });
});
