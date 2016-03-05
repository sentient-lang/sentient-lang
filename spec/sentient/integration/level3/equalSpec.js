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

describe("Integration: 'equal'", function () {
  it("produces the correct result for booleans", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: false },
        { type: "constant", value: false },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "constant", value: false },
        { type: "constant", value: true },
        { type: "equal" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "equal" },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" },

        { type: "constant", value: true },
        { type: "constant", value: true },
        { type: "equal" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "d" }
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
    expect(result.c).toEqual(false);
    expect(result.d).toEqual(true);
  });

  it("produces the correct result for integers", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -5 },
        { type: "constant", value: -5 },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "constant", value: 2 },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "constant", value: 10 },
        { type: "constant", value: 0 },
        { type: "equal" },
        { type: "pop", symbol: "c" },
        { type: "variable", symbol: "c" },

        { type: "constant", value: 13 },
        { type: "constant", value: 13 },
        { type: "equal" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "d" }
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
    expect(result.c).toEqual(false);
    expect(result.d).toEqual(true);
  });

  describe("arrays", function () {
    it("returns true if the arrays contain equal elements", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: false },
          { type: "constant", value: true },
          { type: "constant", value: true },
          { type: "collect", width: 3 },
          { type: "constant", value: false },
          { type: "constant", value: true },
          { type: "constant", value: true },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" },

          { type: "constant", value: false },
          { type: "constant", value: true },
          { type: "constant", value: true },
          { type: "collect", width: 3 },
          { type: "constant", value: false },
          { type: "constant", value: false },
          { type: "constant", value: true },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "b" },
          { type: "variable", symbol: "b" },

          { type: "constant", value: -5 },
          { type: "constant", value: 3 },
          { type: "constant", value: 2 },
          { type: "collect", width: 3 },
          { type: "constant", value: -5 },
          { type: "constant", value: 3 },
          { type: "constant", value: 2 },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "c" },
          { type: "variable", symbol: "c" },

          { type: "constant", value: 5 },
          { type: "constant", value: 3 },
          { type: "constant", value: 2 },
          { type: "collect", width: 3 },
          { type: "constant", value: -5 },
          { type: "constant", value: 3 },
          { type: "constant", value: 2 },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "d" },
          { type: "variable", symbol: "d" }
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
      expect(result.c).toEqual(true);
      expect(result.d).toEqual(false);
    });

    it("works for nested arrays", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "collect", width: 2 },
          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },

          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "collect", width: 2 },
          { type: "constant", value: true },
          { type: "constant", value: false },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },

          { type: "equal" },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" },

          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "constant", value: 30 },
          { type: "constant", value: 40 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },

          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "constant", value: 40 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 },

          { type: "equal" },
          { type: "pop", symbol: "b" },
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

      expect(result.a).toEqual(true);
      expect(result.b).toEqual(false);
    });

    it("returns false if the lengths differ", function () {
      var program = Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "collect", width: 2 },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },

          { type: "equal" },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" }
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

      expect(result.a).toEqual(false);
    });

    it("integrates correctly with fetch", function () {
      var program = Level3Compiler.compile({
        instructions: [
          // [[10, 20, 30], [40]]
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 3 },
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "foo" },

          // [[40], [10, 20, 30]]
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 3 },
          { type: "collect", width: 2 },
          { type: "pop", symbol: "bar" },

          // foo[0] == [10, 20, 30]
          { type: "push", symbol: "foo" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "a" },
          { type: "variable", symbol: "a" },

          // [10, 20, 30] == foo[0]
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 3 },
          { type: "push", symbol: "foo" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "equal" },
          { type: "pop", symbol: "b" },
          { type: "variable", symbol: "b" },

          // foo[1] == [40]
          { type: "push", symbol: "foo" },
          { type: "constant", value: 1 },
          { type: "fetch" },
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "equal" },
          { type: "pop", symbol: "c" },
          { type: "variable", symbol: "c" },

          // bar[0] == [40]
          { type: "push", symbol: "bar" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "equal" },
          { type: "pop", symbol: "d" },
          { type: "variable", symbol: "d" },

          // [40] == bar[0]
          { type: "constant", value: 40 },
          { type: "collect", width: 1 },
          { type: "push", symbol: "bar" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "equal" },
          { type: "pop", symbol: "e" },
          { type: "variable", symbol: "e" },

          // bar[1] == [10, 20, 30]
          { type: "push", symbol: "bar" },
          { type: "constant", value: 1 },
          { type: "fetch" },
          { type: "constant", value: 10 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 3 },
          { type: "equal" },
          { type: "pop", symbol: "f" },
          { type: "variable", symbol: "f" },

          // foo[0] == bar[1]
          { type: "push", symbol: "foo" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "push", symbol: "bar" },
          { type: "constant", value: 1 },
          { type: "fetch" },
          { type: "equal" },
          { type: "pop", symbol: "g" },
          { type: "variable", symbol: "g" },

          // foo[1] == bar[0]
          { type: "push", symbol: "foo" },
          { type: "constant", value: 1 },
          { type: "fetch" },
          { type: "push", symbol: "bar" },
          { type: "constant", value: 0 },
          { type: "fetch" },
          { type: "equal" },
          { type: "pop", symbol: "h" },
          { type: "variable", symbol: "h" }
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
      expect(result.b).toEqual(true);
      expect(result.c).toEqual(true);
      expect(result.d).toEqual(true);
      expect(result.e).toEqual(true);
      expect(result.f).toEqual(true);
      expect(result.g).toEqual(true);
      expect(result.h).toEqual(true);
    });
  });

  it("throws an error on a type mismatch", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "constant", value: true },
          { type: "equal" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "equal" }
        ]
      });
    }).toThrow();
  });
});
