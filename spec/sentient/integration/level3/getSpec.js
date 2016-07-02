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

describe("Integration: 'get'", function () {
  it("gets from an integer array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "constant", value: 10 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },
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
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },
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
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
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

  it("provides support for checking bounds", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "array" },

        { type: "push", symbol: "array" },
        { type: "constant", value: -1 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "foo" },
        { type: "pop", symbol: "fooInBounds" },
        { type: "variable", symbol: "foo" },
        { type: "variable", symbol: "fooInBounds" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 2 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "bar" },
        { type: "pop", symbol: "barInBounds" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "barInBounds" }
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

    expect(result.fooInBounds).toEqual(false);
    expect(result.barInBounds).toEqual(false);

    expect(result.foo).toEqual(-1);
    expect(result.bar).toEqual(-1);
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
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "b" },
        { type: "variable", symbol: "b" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
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
        { type: "pop", symbol: "ab_array" },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "c_array" },

        { type: "push", symbol: "ab_array" },
        { type: "push", symbol: "c_array" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "nested_array" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "aInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "b" },
        { type: "pop", symbol: "bInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "cInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 2 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "d" },
        { type: "pop", symbol: "dInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "e" },
        { type: "pop", symbol: "eInBounds" },

        { type: "push", symbol: "nested_array" },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "constant", value: 2 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "f" },
        { type: "pop", symbol: "fInBounds" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },
        { type: "variable", symbol: "e" },
        { type: "variable", symbol: "f" },

        { type: "variable", symbol: "aInBounds" },
        { type: "variable", symbol: "bInBounds" },
        { type: "variable", symbol: "cInBounds" },
        { type: "variable", symbol: "dInBounds" },
        { type: "variable", symbol: "eInBounds" },
        { type: "variable", symbol: "fInBounds" }
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
    expect(result.d).toEqual(-1);

    expect(result.eInBounds).toEqual(false);
    expect(result.e).toEqual(-1);

    expect(result.fInBounds).toEqual(false);
    expect(result.f).toEqual(-1);
  });

  it("works as expected when nested arrays are reassigned", function () {
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
        { type: "get" },

        { type: "pop", symbol: "bar" },
        { type: "push", symbol: "bar" },

        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
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
    expect(result.a).toEqual(-1);
  });

  it("works as expected when nested arrays are re-collected", function () {
    var program = Level3Compiler.compile({
      instructions: [
        // foo = [[1, 2, 3], [4]][1] = [4]
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "constant", value: 3 },
        { type: "collect", width: 3 },
        { type: "constant", value: 4 },
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
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "pop", symbol: "bar" },

        // a = bar[0]
        { type: "push", symbol: "bar" },
        { type: "constant", value: 0 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "aInBounds" },

        // b = bar[1]
        { type: "push", symbol: "bar" },
        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "b" },
        { type: "pop", symbol: "bInBounds" },

        // c = bar[2]
        { type: "push", symbol: "bar" },
        { type: "constant", value: 2 },
        { type: "get", checkBounds: true },
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
    expect(result.a).toEqual(4);

    expect(result.bInBounds).toEqual(false);
    expect(result.b).toEqual(-1);

    expect(result.cInBounds).toEqual(false);
    expect(result.c).toEqual(-1);
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
        { type: "get" },
        { type: "push", symbol: "b" },
        { type: "get" },

        { type: "constant", value: 40 },
        { type: "equal" },
        { type: "invariant" },

        { type: "variable", symbol: "a" },
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

    expect(result.a).toEqual(0);
    expect(result.b).toEqual(3);
  });

  it("works correctly for [[a, b, c]][x][y]", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "pop", symbol: "a" },
        { type: "constant", value: 20 },
        { type: "pop", symbol: "b" },
        { type: "constant", value: 30 },
        { type: "pop", symbol: "c" },

        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "push", symbol: "c" },
        { type: "collect", width: 3 },
        { type: "collect", width: 1 },

        { type: "integer", symbol: "x", width: 6 },
        { type: "integer", symbol: "y", width: 6 },

        { type: "push", symbol: "x" },
        { type: "get" },
        { type: "push", symbol: "y" },
        { type: "get", checkBounds: true },

        { type: "pop", symbol: "out" },
        { type: "pop", symbol: "inBounds" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "y" },
        { type: "variable", symbol: "out" },
        { type: "variable", symbol: "inBounds" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var run = function (assignments) {
      assignments = Level3Runtime.encode(program, assignments);
      assignments = Level2Runtime.encode(program, assignments);
      assignments = Level1Runtime.encode(program, assignments);

      var result = Machine.run(program, assignments)[0];

      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);
      result = Level3Runtime.decode(program, result);

      if (!result.inBounds) {
        return "out of bounds";
      } else {
        return result.out;
      }
    };

    expect(run({ x: 0, y: 0 })).toEqual(10);
    expect(run({ x: 0, y: 1 })).toEqual(20);
    expect(run({ x: 0, y: 2 })).toEqual(30);

    expect(run({ x: 1, y: 0 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 1 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 2 })).toEqual("out of bounds");
  });

  it("works correctly for [[d,e,f],[[a,b],[c]][x]][y][z]", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "pop", symbol: "a" },
        { type: "constant", value: 20 },
        { type: "pop", symbol: "b" },
        { type: "constant", value: 30 },
        { type: "pop", symbol: "c" },
        { type: "constant", value: 40 },
        { type: "pop", symbol: "d" },
        { type: "constant", value: 50 },
        { type: "pop", symbol: "e" },
        { type: "constant", value: 60 },
        { type: "pop", symbol: "f" },

        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "ab_array" },

        { type: "push", symbol: "c" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "c_array" },

        { type: "push", symbol: "d" },
        { type: "push", symbol: "e" },
        { type: "push", symbol: "f" },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "def_array" },

        { type: "push", symbol: "ab_array" },
        { type: "push", symbol: "c_array" },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "abc" },

        { type: "integer", symbol: "x", width: 6 },
        { type: "integer", symbol: "y", width: 6 },
        { type: "integer", symbol: "z", width: 6 },
        { type: "variable", symbol: "x" },
        { type: "variable", symbol: "y" },
        { type: "variable", symbol: "z" },

        { type: "push", symbol: "def_array" },

        { type: "push", symbol: "abc" },
        { type: "push", symbol: "x" },
        { type: "get" },

        { type: "collect", width: 2 },

        { type: "push", symbol: "y" },
        { type: "get" },

        { type: "push", symbol: "z" },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "out" },
        { type: "pop", symbol: "inBounds" },
        { type: "variable", symbol: "out" },
        { type: "variable", symbol: "inBounds" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var run = function (assignments) {
      assignments = Level3Runtime.encode(program, assignments);
      assignments = Level2Runtime.encode(program, assignments);
      assignments = Level1Runtime.encode(program, assignments);

      var result = Machine.run(program, assignments)[0];

      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);
      result = Level3Runtime.decode(program, result);

      if (!result.inBounds) {
        return "out of bounds";
      } else {
        return result.out;
      }
    };

    expect(run({ x: 0, y: 0, z: 0 })).toEqual(40);
    expect(run({ x: 0, y: 0, z: 1 })).toEqual(50);
    expect(run({ x: 0, y: 0, z: 2 })).toEqual(60);
    expect(run({ x: 0, y: 1, z: 0 })).toEqual(10);
    expect(run({ x: 0, y: 1, z: 1 })).toEqual(20);
    expect(run({ x: 0, y: 1, z: 2 })).toEqual("out of bounds");
    expect(run({ x: 0, y: 2, z: 0 })).toEqual("out of bounds");
    expect(run({ x: 0, y: 2, z: 1 })).toEqual("out of bounds");
    expect(run({ x: 0, y: 2, z: 2 })).toEqual("out of bounds");

    expect(run({ x: 1, y: 0, z: 0 })).toEqual(40);
    expect(run({ x: 1, y: 0, z: 1 })).toEqual(50);
    expect(run({ x: 1, y: 0, z: 2 })).toEqual(60);
    expect(run({ x: 1, y: 1, z: 0 })).toEqual(30);
    expect(run({ x: 1, y: 1, z: 1 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 1, z: 2 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 2, z: 0 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 2, z: 1 })).toEqual("out of bounds");
    expect(run({ x: 1, y: 2, z: 2 })).toEqual("out of bounds");

    expect(run({ x: 2, y: 0, z: 0 })).toEqual(40);
    expect(run({ x: 2, y: 0, z: 1 })).toEqual(50);
    expect(run({ x: 2, y: 0, z: 2 })).toEqual(60);
    expect(run({ x: 2, y: 1, z: 0 })).toEqual("out of bounds");
    expect(run({ x: 2, y: 1, z: 1 })).toEqual("out of bounds");
    expect(run({ x: 2, y: 1, z: 2 })).toEqual("out of bounds");
    expect(run({ x: 2, y: 2, z: 0 })).toEqual("out of bounds");
    expect(run({ x: 2, y: 2, z: 1 })).toEqual("out of bounds");
    expect(run({ x: 2, y: 2, z: 2 })).toEqual("out of bounds");
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

        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },
        { type: "constant", value: 0 },
        { type: "get" },

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

  it("returns an empty array if nested index is out of bounds", function () {
    var program = Level3Compiler.compile({
      instructions: [
        // [[10]]
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "array" },

        { type: "push", symbol: "array" },
        { type: "constant", value: 1 },
        { type: "get" },
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

    expect(result.foo).toEqual([]);
  });
});
