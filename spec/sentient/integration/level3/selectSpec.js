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

describe("Integration: 'select'", function () {
  it("selects elements where the function returns true", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "constant", value: 3 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "even?", args: ["element"] },
        { type: "push", symbol: "element" },
        { type: "constant", value: 2 },
        { type: "modulo" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "even?" },
        { type: "select" },
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

    expect(result).toEqual({ out: [2] });
  });

  it("returns an empty array if called on an empty array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "collect", width: 0 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "even?", args: ["element"] },
        { type: "push", symbol: "element" },
        { type: "constant", value: 2 },
        { type: "modulo" },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "even?" },
        { type: "select" },
        { type: "pop", symbol: "out" },

        { type: "variable", symbol: "out" },

        // Otherwise, the SAT problem has no literals:
        { type: "constant", value: 123 },
        { type: "pop", symbol: "x" },
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

    expect(result.out).toEqual([]);
  });

  it("sets the index per iteration", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "foo", args: ["e", "i"] },
        { type: "push", symbol: "i" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "foo" },
        { type: "select" },
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

    expect(result).toEqual({ out: [2] });
  });

  it("sets itPresent per iteration", function () {
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

        { type: "define", name: "foo", args: ["e", "i", "p"] },
        { type: "push", symbol: "p" },
        { type: "not" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "foo" },
        { type: "select" },
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

    expect(result).toEqual({ out: [-1] });
  });

  it("supports nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "myArray" },

        { type: "define", name: "foo", args: ["arr"] },
        { type: "push", symbol: "arr" },
        { type: "width" },
        { type: "constant", value: 1 },
        { type: "equal" },
        { type: "return", width: 1 },

        { type: "push", symbol: "myArray" },
        { type: "pointer", name: "foo" },
        { type: "select" },
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

    expect(result).toEqual({ out: [[10]] });
  });
});
