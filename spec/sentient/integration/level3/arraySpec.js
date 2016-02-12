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

describe("Integration: 'array'", function () {
  it("declares an array of an arbitrary type", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "foo", width: 3 },
        { type: "variable", symbol: "foo" },

        { type: "typedef", name: "boolean" },
        { type: "array", symbol: "bar", width: 3 },
        { type: "variable", symbol: "bar" },

        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 4 },
        { type: "array", symbol: "baz", width: 3 },
        { type: "variable", symbol: "baz" },

        { type: "typedef", name: "boolean" },
        { type: "typedef", name: "array", width: 2 },
        { type: "typedef", name: "array", width: 3 },
        { type: "array", symbol: "qux", width: 4 },
        { type: "variable", symbol: "qux" }
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

    expect(result.foo).toEqual([0, 0, 0]);
    expect(result.bar).toEqual([false, false, false]);
    expect(result.baz).toEqual([
      [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]
    ]);

    expect(result.qux).toEqual([
      [[false, false], [false, false], [false, false]],
      [[false, false], [false, false], [false, false]],
      [[false, false], [false, false], [false, false]],
      [[false, false], [false, false], [false, false]]
    ]);
  });

  it("throws an error for an array typedef is the stack is empty", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "typedef", name: "array", width: 4 },
        ]
      });
    }).toThrow();
  });

  it("throws an error for an empty array", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "typedef", name: "array", width: 0 },
        ]
      });
    }).toThrow();
  });
});
