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
  it("tests equality for booleans", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: false },
        { type: "constant", value: false },
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

    expect(result.a).toEqual(true);

    program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: false },
        { type: "constant", value: true },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(false);
  });

  it("tests equality for integers", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -3 },
        { type: "constant", value: -3 },
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

    expect(result.a).toEqual(true);

    program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -3 },
        { type: "constant", value: 3 },
        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(false);
  });

  it("tests equality for arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -3 },
        { type: "constant", value: -3 },
        { type: "collect", width: 2 },

        { type: "constant", value: -3 },
        { type: "constant", value: -3 },
        { type: "collect", width: 2 },

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

    expect(result.a).toEqual(true);

    program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -3 },
        { type: "constant", value: 3 },
        { type: "collect", width: 2 },

        { type: "constant", value: 3 },
        { type: "constant", value: -3 },
        { type: "collect", width: 2 },

        { type: "equal" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(false);
  });

  it("tests equality for different sized arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: -3 },
        { type: "constant", value: -3 },
        { type: "collect", width: 2 },

        { type: "constant", value: -3 },
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

  it("integrates correctly when fetching the larger array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },

        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },

        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },

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

    expect(result.a).toEqual(true);
  });

  it("integrates correctly when fetching the smaller array", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },

        { type: "collect", width: 2 },
        { type: "constant", value: 1 },
        { type: "fetch" },

        { type: "constant", value: 30 },
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

    expect(result.a).toEqual(true);
  });

  it("throws an error if there are fewer than two symbols", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: false },
          { type: "equal" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if one of the types is incorrect", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "constant", value: true },
          { type: "equal" }
        ]
      });
    }).toThrow();
  });
});
