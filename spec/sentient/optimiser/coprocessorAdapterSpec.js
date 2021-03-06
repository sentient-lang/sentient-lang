"use strict";

var SpecHelper = require("../../specHelper");

var optimiser = "../../../lib/sentient/optimiser";
var describedClass = require(optimiser + "/coprocessorAdapter");
var Sentient = require("../../../lib/sentient");

describe("CoprocessorAdapter", function () {
  it("does not affect machine code that's already optimal", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 2
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 2 2                         \n\
        1 0                               \n\
        -2 0                              \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 2 2                         \n\
        1 0                               \n\
        -2 0                              \n\
      ")
    });
  });

  it("does not remove redundant literals that are variables", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 3,
        c: 4,
        d: 5
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 4 4                         \n\
        1 -1 0                            \n\
        4 -4 0                            \n\
        3 5 0                             \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3,
        d: 4
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 4 3                         \n\
        2 4 0                             \n\
        1 -1 0                            \n\
        3 -3 0                            \n\
      ")
    });
  });

  it("makes use of the coprocessor's 'dense' option", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 2,
        out: 9
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 9 3                         \n\
        -1 -2 9 0                         \n\
        1 -9 0                            \n\
        2 -9 0                            \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2,
        out: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    });
  });

  it("does unit propogation and leaves the remaining tautologies", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 2,
        out: 9
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 9 3                         \n\
        -1 -2 9 0                         \n\
        1 -9 0                            \n\
        2 -9 0                            \n\
        9 0                               \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2,
        out: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        3 0                               \n\
        1 0                               \n\
        2 0                               \n\
      ")
    });
  });

  it("removes tautologies that do not appear in the variables", function () {
    var result = describedClass.optimise({
      level1Variables: {
        out: 9
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 9 3                         \n\
        -1 -2 9 0                         \n\
        1 -9 0                            \n\
        2 -9 0                            \n\
        9 0                               \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        out: 1
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 1 1                         \n\
        1 0                               \n\
      ")
    });
  });

  it("removes falsehood literals from clauses", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 2
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 2                         \n\
        -3 0                              \n\
        1 2 3 0                           \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 2 1                         \n\
        1 2 0                             \n\
      ")
    });
  });

  it("preserves falsehoods that appear in the variables", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 2                         \n\
        -3 0                              \n\
        1 2 3 0                           \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 2                         \n\
        -3 0                              \n\
        1 2 0                             \n\
      ")
    });
  });

  it("writes a single unsat clause for an unsatisfiable problem", function () {
    var result = describedClass.optimise({
      level1Variables: {
        a: 1,
        b: 1
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 5 3                         \n\
        1 0                               \n\
        -1 0                              \n\
        2 3 4 5 0                         \n\
      ")
    });

    expect(result).toEqual({
      level1Variables: {
        a: 1,
        b: 1
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 1 2                         \n\
        0                                 \n\
        1 -1 0                            \n\
      ")
    });
  });

  it("ensures consistency when optimising (1)", function () {
    var program = Sentient.compile("     \n\
      int a, b, c;                       \n\
      invariant a * a + b * b == c * c;  \n\
      invariant a > 0, b > 0, c > 0;     \n\
      expose a, b, c;                    \n\
    ");

    var optimisedProgram = describedClass.optimise(program);
    var result = Sentient.run({
      program: optimisedProgram,
      assignments: { c: 5 },
      number: 3
    });

    expect(result).toEqual([
      { a: 3, b: 4, c: 5 },
      { a: 4, b: 3, c: 5 },
      {}
    ]);
  });

  it("ensures consistency when optimising (2)", function () {
    var program = Sentient.compile("\n\
      array3<int> numbers;          \n\
      total = 0;                    \n\
      numbers.each(function^ (n) {  \n\
        invariant n > 0;            \n\
        total += n;                 \n\
      });                           \n\
      expose numbers, total;        \n\
    ");

    var optimisedProgram = describedClass.optimise(program);
    var result = Sentient.run({
      program: optimisedProgram,
      assignments: { total: 100 },
      number: 3
    });

    expect(result).toEqual([
      { total: 100, numbers: [ 64, 1, 35 ] },
      { total: 100, numbers: [ 49, 17, 34 ] },
      { total: 100, numbers: [ 1, 67, 32 ] }
    ]);
  });

  it("ensures consistency when optimising (3)", function () {
    var program = Sentient.compile("\n\
      int a;                        \n\
      invariant a == 1;             \n\
      invariant a == 2;             \n\
      expose a;                     \n\
    ");

    var optimisedProgram = describedClass.optimise(program);
    var result = Sentient.run({ program: optimisedProgram });

    expect(result).toEqual([{}]);
  });

  it("ensures consistency when optimising (3)", function () {
    var program = Sentient.compile("\n\
      int1 a;                       \n\
      expose a;                     \n\
    ");

    var optimisedProgram = describedClass.optimise(program);
    var result = Sentient.run({
      program: optimisedProgram,
      number: 0
    });

    expect(result).toEqual([
      { a: 0 },
      { a: -1 },
      {}
    ]);
  });

  describe("logging", function () {
    it("logs stderr if the log level is debug", function () {
      var messages = [];

      Sentient.logger.level = "debug";

      Sentient.logger.log = function (message) {
        messages.push(message);
      };

      describedClass.optimise({
        level1Variables: {
          a: 1
        },
        dimacs: SpecHelper.stripWhitespace("\n\
          p cnf 2 2                         \n\
          1 0                               \n\
          2 0                               \n\
        ")
      });

      expect(messages.length).toEqual(1);
      expect(messages[0].substring(0, 32)).toEqual(
        "Riss Coprocessor wrote to stderr"
      );

      Sentient.logger.reset();
    });
  });

  it("throws an error if the binary cannot be found", function () {
    expect(function () {
      new describedClass("does_not_exist", "p cnf 1 1\n1 0").optimise();
    }).toThrow();
  });
});
