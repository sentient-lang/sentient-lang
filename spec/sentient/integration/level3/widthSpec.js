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

describe("Integration: 'width'", function () {
  it("returns the width of the array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "width" },

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

    expect(result.foo).toEqual(3);
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
        { type: "width" },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "width" },
        { type: "pop", symbol: "bar" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "width" },
        { type: "pop", symbol: "baz" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 2 },
        { type: "get" },
        { type: "width" },
        { type: "pop", symbol: "qux" },

        { type: "variable", symbol: "foo" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "baz" },
        { type: "variable", symbol: "qux" }
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

    expect(result.foo).toEqual(2);
    expect(result.bar).toEqual(2);
    expect(result.baz).toEqual(1);
    expect(result.qux).toEqual(0);
  });
});
