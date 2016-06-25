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

describe("Integration: 'getIndex'", function () {
  it("gets from an integer array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "constant", value: 10 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 1 },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" }
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

    expect(result.a).toEqual(5);
    expect(result.b).toEqual(10);
  });

  it("gets from a boolean array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 1 },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" }
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

    expect(result.a).toEqual(true);
    expect(result.b).toEqual(false);
  });

  it("gets from a nested array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "constant", value: 10 },
        { type: "collect", width: 2 },

        { type: "constant", value: 15 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },

        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 1 },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 1 },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" }
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

    expect(result.a).toEqual([5, 10]);
    expect(result.b).toEqual([15, 20]);
    expect(result.c).toEqual(15);
  });

  it("throws an error if index is guaranteed to be out of bounds", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "constant", value: 2 },
          { type: "collect", width: 2 },
          { type: "getIndex", index: -1 }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 1 },
          { type: "constant", value: 2 },
          { type: "collect", width: 2 },
          { type: "getIndex", index: 2 }
        ]
      });
    }).toThrow();
  });

  it("provides support for checking bounds", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "array" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "getIndex", index: 0, checkBounds: true },
        { type: "pop", symbol: "foo" },
        { type: "pop", symbol: "fooInBounds" },
        { type: "variable", symbol: "foo" },
        { type: "variable", symbol: "fooInBounds" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "bar" },
        { type: "pop", symbol: "barInBounds" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "barInBounds" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "getIndex", index: 0, checkBounds: true },
        { type: "pop", symbol: "baz" },
        { type: "pop", symbol: "bazInBounds" },
        { type: "variable", symbol: "baz" },
        { type: "variable", symbol: "bazInBounds" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "qux" },
        { type: "pop", symbol: "quxInBounds" },
        { type: "variable", symbol: "qux" },
        { type: "variable", symbol: "quxInBounds" }
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

    expect(result.fooInBounds).toEqual(true);
    expect(result.barInBounds).toEqual(true);
    expect(result.bazInBounds).toEqual(true);
    expect(result.quxInBounds).toEqual(false);

    expect(result.foo).toEqual(10);
    expect(result.bar).toEqual(20);
    expect(result.baz).toEqual(30);
    expect(result.qux).toEqual(0);
  });

  it("can get from nested arrays of different widths", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },

        { type: "constant", value: 3 },
        { type: "collect", width: 1 },

        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 1 },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "getIndex", index: 1 },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" }
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

    expect(result.a).toEqual(1);
    expect(result.b).toEqual(2);
    expect(result.c).toEqual(3);
  });

  it("can check bounds for nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "nested_array" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "getIndex", index: 0, checkBounds: true },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "aInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "b" },
        { type: "pop", symbol: "bInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "getIndex", index: 0, checkBounds: true },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "cInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "d" },
        { type: "pop", symbol: "dInBounds" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },

        { type: "variable", symbol: "aInBounds" },
        { type: "variable", symbol: "bInBounds" },
        { type: "variable", symbol: "cInBounds" },
        { type: "variable", symbol: "dInBounds" }
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

    expect(result.aInBounds).toEqual(true);
    expect(result.a).toEqual(10);

    expect(result.bInBounds).toEqual(true);
    expect(result.b).toEqual(20);

    expect(result.cInBounds).toEqual(true);
    expect(result.c).toEqual(30);

    expect(result.dInBounds).toEqual(false);
    expect(result.d).toEqual(0);
  });

  it("works as expected when nested arrays are reassigned", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },
        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },

        { type: "pop", symbol: "bar" },
        { type: "push", symbol: "bar" },

        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "aInBounds" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "aInBounds" }
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

    expect(result.aInBounds).toEqual(false);
    expect(result.a).toEqual(0);
  });

  it("works as expected when nested arrays are re-collected", function () {
    var program = Level3Compiler.compile({
      instructions: [
        // foo = [[1, 2, 3], [4]][1] = [4]
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 3 },
        { type: "constant", value: 40 },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "foo" },

        // bar = [foo, [5, 6]][0] = foo = [4]
        { type: "push", symbol: "foo" },
        { type: "constant", value: 5 },
        { type: "constant", value: 6 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "getIndex", index: 0 },
        { type: "pop", symbol: "bar" },

        // a = bar[0]
        { type: "push", symbol: "bar" },
        { type: "getIndex", index: 0, checkBounds: true },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "aInBounds" },

        // b = bar[1]
        { type: "push", symbol: "bar" },
        { type: "getIndex", index: 1, checkBounds: true },
        { type: "pop", symbol: "b" },
        { type: "pop", symbol: "bInBounds" },

        // c = bar[2]
        { type: "push", symbol: "bar" },
        { type: "getIndex", index: 2, checkBounds: true },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "cInBounds" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "aInBounds" },
        { type: "variable", symbol: "bInBounds" },
        { type: "variable", symbol: "cInBounds" }
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

    expect(result.aInBounds).toEqual(true);
    expect(result.a).toEqual(40);

    expect(result.bInBounds).toEqual(false);
    expect(result.b).toEqual(0);

    expect(result.cInBounds).toEqual(false);
    expect(result.c).toEqual(0);
  });

  it("works for heavily nested array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        // [[[[[10]]]]]
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },

        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 0 },
        { type: "getIndex", index: 0 },

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

    expect(result.foo).toEqual(10);
  });
});
