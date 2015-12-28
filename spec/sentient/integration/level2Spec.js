"use strict";

var Level2Compiler = require("../../../lib/sentient/compiler/level2Compiler");
var Level2Runtime = require("../../../lib/sentient/runtime/level2Runtime");

var Level1Compiler = require("../../../lib/sentient/compiler/level1Compiler");
var Level1Runtime = require("../../../lib/sentient/runtime/level1Runtime");

var Machine = require("../../../lib/sentient/machine");

describe("Level 2 Abstraction", function () {
  var program, level1Code;

  beforeEach(function () {
    level1Code = Level2Compiler.compile({
      metadata: {
        title: "Total 100",
        description: "Find three numbers that total 100",
        author: "Chris Patuzzo",
        date: "2015-11-30"
      },
      instructions: [
        { type: "integer", symbol: "a", width: 8 },
        { type: "integer", symbol: "b", width: 8 },
        { type: "integer", symbol: "c", width: 8 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "push", symbol: "c" },
        { type: "add" },
        { type: "add" },
        { type: "constant", value: 100 },
        { type: "equal" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "out" }
      ]
    });

    program = Level1Compiler.compile(level1Code);
  });

  it("can find a solution", function () {
    var assignments = { b: 25, out: true };
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result).toEqual({
      a: -41,
      b: 25,
      c: 116,
      out: true
    });
  });

  it("works as expected for a number of examples", function () {
    for (var i = -20; i < 20; i += 1) {
      var assignments = { a: i, out: true };

      assignments = Level2Runtime.encode(program, assignments);
      assignments = Level1Runtime.encode(program, assignments);

      var result = Machine.run(program, assignments);
      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);

      expect(result.a + result.b + result.c).toEqual(100);
    }
  });

  it("returns an empty object if there are no solutions", function () {
    var assignments = { a: -20, b: -20, out: true };
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(result).toEqual({});
  });
});
