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

describe("Integration: function pointers", function () {
  it("can call a function with a pointer to another function", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "define", name: "foo", args: ["*func"] },
        { type: "call", name: "func", width: 0 },
        { type: "return", width: 1 },

        { type: "define", name: "bar", args: [] },
        { type: "constant", value: 123 },
        { type: "return", width: 1 },

        { type: "define", name: "baz", args: [] },
        { type: "constant", value: 456 },
        { type: "return", width: 1 },

        { type: "pointer", name: "bar" },
        { type: "call", name: "foo", width: 1 },
        { type: "pop", symbol: "a" },

        { type: "pointer", name: "baz" },
        { type: "call", name: "foo", width: 1 },
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

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ a: 123, b: 456 });
  });
});
