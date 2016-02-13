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

var _ = require("underscore");

describe("Integration: 'variable'", function () {
  it("only exposes the specified variables", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "boolean", symbol: "a" },
        { type: "boolean", symbol: "b" },
        { type: "constant", value: true },
        { type: "constant", value: false },
        { type: "pop", symbol: "c" },
        { type: "pop", symbol: "d" },
        { type: "variable", symbol: "b" },
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

    expect(_.keys(result)).toEqual(["b", "c"]);
  });

  it("works with arbitrarily nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: true },
        { type: "collect", width: 1 },
        { type: "constant", value: false },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" }
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

    expect(result.foo).toEqual([[[true], [false]]]);
  });

  it("can assign array elements using the array syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: [[1, 2], [undefined, 3], undefined, [undefined, 5]]
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("can assign array elements using the object syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: {
        0: { 0: 1, 1: 2 },
        1: { 1: 3 },
        3: { 1: 5 }
      }
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("can assign array elements using a mixture of syntax", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "typedef", name: "array", width: 2 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {
      foo: {
        0: [1, 2],
        1: { 1: 3 },
        2: undefined,
        3: { 1: 5 }
      }
    });

    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([
      [1, 2], [0, 3], [0, 0], [0, 5]
    ]);
  });

  it("throws an error if the variable is not declared", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "variable", symbol: "missing" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if elements are missing", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "foo", width: 4 },
        { type: "variable", symbol: "foo" }
      ]
    });

    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    expect(function () {
      Level3Runtime.encode(program, { foo: [1, 2, 3] });
    }).toThrow();
  });
});
