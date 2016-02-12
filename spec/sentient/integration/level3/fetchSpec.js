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

describe("Integration: 'fetch'", function () {
  it("fetches from an integer array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "constant", value: 10 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },
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

    expect(result.a).toEqual(5);
    expect(result.b).toEqual(10);
  });

  it("fetches from a boolean array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },
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

    expect(result.a).toEqual(true);
    expect(result.b).toEqual(false);
  });

  it("fetches from a nested array", function () {
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
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" }
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

    expect(result.a).toEqual([5, 10]);
    expect(result.b).toEqual([15, 20]);
    expect(result.c).toEqual(15);
  });

  it("places invariants on the range of values for a key", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },

        { type: "constant", value: -1 },
        { type: "fetch" },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" },
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

    expect(result).toEqual({});

    program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },

        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" },
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

    expect(result).toEqual({});
  });

  it("can fetch from nested arrays of different widths", function () {
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
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" },
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

    expect(result.a).toEqual(1);
    expect(result.b).toEqual(2);
    expect(result.c).toEqual(3);
  });

  it("places invariants on the keys for nested arrays", function () {
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
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "constant", value: 1 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },
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

    expect(result).toEqual({});
  });

  it("can be used in reverse to lookup an index", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "constant", value: 40 },
        { type: "constant", value: 50 },
        { type: "collect", width: 5 },

        { type: "constant", value: 15 },
        { type: "constant", value: 30 },
        { type: "constant", value: 45 },
        { type: "collect", width: 3 },

        { type: "collect", width: 2 },

        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },

        { type: "push", symbol: "a" },
        { type: "fetch" },
        { type: "push", symbol: "b" },
        { type: "fetch" },

        { type: "constant", value: 40 },
        { type: "equal" },
        { type: "invariant" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
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

    expect(result.a).toEqual(0);
    expect(result.b).toEqual(3);
  });
});
