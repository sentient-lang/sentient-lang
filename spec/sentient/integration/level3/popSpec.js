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

describe("Integration: 'pop'", function () {
  it("pops the variable from the top of the stack", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 5 },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(5);
  });

  it("copies over conditional invariants if present", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 2 },
        { type: "constant", value: 1 },
        { type: "get" },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 1 },
        { type: "get", checkBounds: true },
        { type: "pop", symbol: "bar" },
        { type: "pop", symbol: "barInBounds" },
        { type: "variable", symbol: "bar" },
        { type: "variable", symbol: "barInBounds" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.bar).toEqual(0);
    expect(result.barInBounds).toEqual(false);
  });

  it("replaces conditional invariants when reassigned", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "collect", width: 1 },
        { type: "constant", value: 20 },
        { type: "constant", value: 30 },
        { type: "collect", width: 2 },
        { type: "collect", width: 2 },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "foo" },

        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "constant", value: 3 },
        { type: "collect", width: 3 },
        { type: "pop", symbol: "foo" },

        { type: "variable", symbol: "foo" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result).toEqual({ foo: [1, 2, 3] });
  });

  it("supports re-assignment of primitives", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "pop", symbol: "foo" },
        { type: "constant", value: 20 },
        { type: "pop", symbol: "foo" },
        { type: "variable", symbol: "foo" },

        { type: "constant", value: false },
        { type: "pop", symbol: "bar" },
        { type: "constant", value: true },
        { type: "pop", symbol: "bar" },
        { type: "variable", symbol: "bar" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual(20);
    expect(result.bar).toEqual(true);
  });

  it("supports re-assignment of arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "pop", symbol: "foo" },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },

        { type: "variable", symbol: "foo" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([30]);
  });

  it("supports re-assignment of nested arrays", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "constant", value: 20 },
        { type: "collect", width: 2 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },

        { type: "constant", value: 30 },
        { type: "collect", width: 1 },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },

        { type: "variable", symbol: "foo" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.foo).toEqual([[30]]);
  });

  it("integrates re-assignment correctly with fetch", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "constant", value: 10 },
        { type: "pop", symbol: "x" },

        { type: "push", symbol: "x" },
        { type: "collect", width: 1 },
        { type: "pop", symbol: "foo" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "a" },

        { type: "constant", value: 20 },
        { type: "pop", symbol: "x" },

        { type: "push", symbol: "foo" },
        { type: "constant", value: 0 },
        { type: "fetch" },
        { type: "pop", symbol: "b" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments)[0];

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(result.a).toEqual(10);
    expect(result.b).toEqual(20);
  });

  it("throws an error if a re-assignment changes type", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "pop", symbol: "foo" },
          { type: "constant", value: true },
          { type: "pop", symbol: "foo" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if array re-assignment changes type", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" },

          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if nested array re-assignment changes type", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" },

          { type: "constant", value: true },
          { type: "collect", width: 1 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" }
        ]
      });
    }).toThrow();

    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" },

          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "pop", symbol: "foo" }
        ]
      });
    }).toThrow();
  });

  it("throws an error if the stack is empty", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "pop", symbol: "a" }
        ]
      });
    }).toThrow();
  });
});

