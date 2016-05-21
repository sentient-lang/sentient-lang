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

describe("Integration: 'collect'", function () {
  it("collects N elements into an array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: -2 },
        { type: "constant", value: 3 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" },

        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "bar" },
        { type: "variable", symbol: "bar" },

        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "duplicate" },
        { type: "constant", value: 5 },
        { type: "equal" },
        { type: "invariant" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "baz" },
        { type: "variable", symbol: "baz" },

        { type: "push", symbol: "foo" },
        { type: "push", symbol: "baz" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "qux" },
        { type: "variable", symbol: "qux" },

        { type: "push", symbol: "bar" },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "abc" },
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

    expect(result.foo).toEqual([1, -2, 3]);
    expect(result.bar).toEqual([true, false]);
    expect(result.baz).toEqual([0, 5]);
    expect(result.qux).toEqual([
      [1, -2, 3], [0, 5]
    ]);
    expect(result.abc).toEqual([[[[[[true, false]]]]]]);
  });

  it("throws an error for mixed type arrays", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "constant", value: true },
          { type: "collect", width: 2 }
        ]
      });
    }).toThrow();
  });

  it("throws an error for nested mixed type arrays", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "collect", width: 1 },
          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "collect", width: 2 }
        ]
      });
    }).toThrow();
  });
});
