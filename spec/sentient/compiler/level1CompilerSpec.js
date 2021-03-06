"use strict";

var compiler = "../../../lib/sentient/compiler";

var SpecHelper = require("../../specHelper");
var describedClass = require(compiler + "/level1Compiler");

describe("Compiler", function () {
  it("compiles the simplest program", function () {
    var code = describedClass.compile({
      instructions: []
    });

    expect(code).toEqual({
      level1Variables: {},
      dimacs: "p cnf 0 0\n"
    });
  });

  it("compiles a simple program", function () {
    var code = describedClass.compile({
      metadata: {
        title: "Three-Way AND",
        description: "A simple 3-bit AND gate",
        author: "Chris Patuzzo",
        date: "2015-11-25"
      },
      instructions: [
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "push", symbol: "c" },
        { type: "and" },
        { type: "and" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "out" }
      ]
    });

    expect(code).toEqual({
      title: "Three-Way AND",
      description: "A simple 3-bit AND gate",
      author: "Chris Patuzzo",
      date: "2015-11-25",
      level1Variables: {
        a: 1,
        b: 2,
        c: 3,
        out: 5
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 5 9                         \n\
        1 -1 0                            \n\
        2 -2 0                            \n\
        3 -3 0                            \n\
        -2 -3 4 0                         \n\
        2 -4 0                            \n\
        3 -4 0                            \n\
        -1 -4 5 0                         \n\
        1 -5 0                            \n\
        4 -5 0                            \n\
      ")
    });
  });

  it("compiles a complicated program", function () {
    var code = describedClass.compile({
      metadata: {
        title: "Complicated Program",
        description: "An example program with lots of instructions",
        author: "Chris Patuzzo",
        date: "2015-11-25"
      },
      instructions: [
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "true" },
        { type: "and" },
        { type: "and" },
        { type: "pop", symbol: "c" },
        { type: "push", symbol: "a" },
        { type: "not" },
        { type: "push", symbol: "b" },
        { type: "false" },
        { type: "or" },
        { type: "pop", symbol: "d" },
        { type: "push", symbol: "c" },
        { type: "push", symbol: "d" },
        { type: "equal" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "out" }
      ]
    });

    expect(code).toEqual({
      title: "Complicated Program",
      description: "An example program with lots of instructions",
      author: "Chris Patuzzo",
      date: "2015-11-25",
      level1Variables: {
        a: 1,
        b: 2,
        out: 9
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 9 19                        \n\
        1 -1 0                            \n\
        2 -2 0                            \n\
        3 0                               \n\
        -2 -3 4 0                         \n\
        2 -4 0                            \n\
        3 -4 0                            \n\
        -1 -4 5 0                         \n\
        1 -5 0                            \n\
        4 -5 0                            \n\
        1 6 0                             \n\
        -1 -6 0                           \n\
        -7 0                              \n\
        2 7 -8 0                          \n\
        -2 8 0                            \n\
        -7 8 0                            \n\
        5 8 9 0                           \n\
        5 -8 -9 0                         \n\
        -5 8 -9 0                         \n\
        -5 -8 9 0                         \n\
      ")
    });
  });

  it("can optionally take a callback object", function () {
    var program;

    var callbackObject = {
      write: function (output) {
        program = output;
      }
    };

    var result = describedClass.compile({
      metadata: {
        title: "Three-Way AND",
        description: "A simple 3-bit AND gate",
        author: "Chris Patuzzo",
        date: "2015-11-25"
      },
      instructions: [
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "push", symbol: "c" },
        { type: "and" },
        { type: "and" },
        { type: "pop", symbol: "out" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "out" }
      ]
    }, callbackObject);

    expect(result).toBeUndefined();
    expect(program).toBeDefined();
  });

  it("catches errors and re-packages them", function () {
    var error;

    try {
      describedClass.compile({
        instructions: [
          { type: "pop", symbol: "out" }
        ]
      });
    } catch (e) {
      error = e;
    }

    expect(error.originatingLevel).toEqual(1);
    expect(error.level1Instruction).toEqual({ type: "pop", symbol: "out" });
    expect(error.message).toEqual("Cannot pop from an empty stack");
  });
});
