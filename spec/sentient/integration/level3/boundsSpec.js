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

describe("Integration: 'bounds'", function () {
  it("checks whether a given index is in bounds of the array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "array" },

        { type: "push", symbol: "array" },
        { type: "constant", value: -1 },
        { type: "bounds" },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "bounds" },
        { type: "pop", symbol: "bar" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "bounds" },
        { type: "pop", symbol: "baz" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 2 },
        { type: "bounds" },
        { type: "pop", symbol: "qux" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 3 },
        { type: "bounds" },
        { type: "pop", symbol: "abc" },

        { type: "variable", symbol: "foo" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "baz" },
        { type: "variable", symbol: "qux" },
        { type: "variable", symbol: "abc" }
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

    expect(result.foo).toEqual(false);
    expect(result.bar).toEqual(true);
    expect(result.baz).toEqual(true);
    expect(result.qux).toEqual(true);
    expect(result.abc).toEqual(false);
  });

  it("works for nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        // [[10, 20], [30]]
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },

        { type: "collect", width: 2 },

        { type: "pop", symbol: "array" },

        { type: "push", symbol: "array" },
        { type: "constant", value: -1 },
        { type: "bounds" },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "bounds" },
        { type: "pop", symbol: "bar" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "bounds" },
        { type: "pop", symbol: "baz" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 2 },
        { type: "bounds" },
        { type: "pop", symbol: "qux" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "first" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "second" },

        // [10, 20]
        { type: "push", symbol: "first" },
        { type: "constant", value: -1 },
        { type: "bounds" },
        { type: "pop", symbol: "a" },

        { type: "push", symbol: "first" },
        { type: "constant", value: 0 },
        { type: "bounds" },
        { type: "pop", symbol: "b" },

        { type: "push", symbol: "first" },
        { type: "constant", value: 1 },
        { type: "bounds" },
        { type: "pop", symbol: "c" },

        { type: "push", symbol: "first" },
        { type: "constant", value: 2 },
        { type: "bounds" },
        { type: "pop", symbol: "d" },

        // [30]
        { type: "push", symbol: "second" },
        { type: "constant", value: -1 },
        { type: "bounds" },
        { type: "pop", symbol: "z" },

        { type: "push", symbol: "second" },
        { type: "constant", value: 0 },
        { type: "bounds" },
        { type: "pop", symbol: "y" },

        { type: "push", symbol: "second" },
        { type: "constant", value: 1 },
        { type: "bounds" },
        { type: "pop", symbol: "x" },

        { type: "variable", symbol: "foo" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "baz" },
        { type: "variable", symbol: "qux" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },

        { type: "variable", symbol: "z" },
        { type: "variable", symbol: "y" },
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

    expect(result.foo).toEqual(false);
    expect(result.bar).toEqual(true);
    expect(result.baz).toEqual(true);
    expect(result.qux).toEqual(false);

    expect(result.a).toEqual(false);
    expect(result.b).toEqual(true);
    expect(result.c).toEqual(true);
    expect(result.d).toEqual(false);

    expect(result.z).toEqual(false);
    expect(result.y).toEqual(true);
    expect(result.x).toEqual(false);
  });
});
