"use strict";

var SpecHelper = require("../specHelper");
var describedClass = require("../../lib/sentient/machine");

describe("Machine", function () {
  it("runs the program, returning assignments for literals", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, { 3: true });

    expect(result).toEqual([{ 1: true, 2: true, 3: true }]);
  });

  it("only returns literals that appear in the metadata", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, { 3: true });

    expect(result).toEqual([{ 1: true, 3: true }]);
  });

  it("can be run with an empty set of assignments", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, {});

    expect(result).toEqual([{ 1: true, 2: false, 3: false }]);
  });

  it("returns an empty object if there are no solutions", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 1 2                         \n\
        1 0                               \n\
        -1 0                              \n\
      ")
    }, {});

    expect(result).toEqual([{}]);
  });

  it("can be run more than once to find multiple solutions", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, {}, 3);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false }
    ]);
  });

  it("it stops running if the solutions are exhausted", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, {}, 99);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false },
      { 1: true, 2: true, 3: true },
      {}
    ]);
  });

  it("runs until exhaustion when a count of '0' is specified", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
      ")
    }, {}, 0);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false },
      { 1: true, 2: true, 3: true },
      {}
    ]);
  });

  it("does not produce duplicate solutions for unnamed variables", function () {
    var result = describedClass.run({
      level1Variables: {
        a: 1,
        b: 2,
        c: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 3                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
        4 5 0                             \n\
        6 7 0                             \n\
      ")
    }, {}, 0);

    expect(result).toEqual([
      { 1: false, 2: true, 3: false },
      { 1: true, 2: false, 3: false },
      { 1: false, 2: false, 3: false },
      { 1: true, 2: true, 3: true },
      {}
    ]);
  });

  describe("when provided with a callback function", function () {
    var program;

    beforeEach(function () {
      program = {
        level1Variables: {
          a: 1,
          b: 2,
          c: 3
        },
        dimacs: SpecHelper.stripWhitespace("\n\
          p cnf 3 3                         \n\
          -1 -2 3 0                         \n\
          1 -3 0                            \n\
          2 -3 0                            \n\
        ")
      };
    });

    it("returns the timer that's running the asynchronous code", function () {
      var result = describedClass.run(program, {}, 1, function () {});
      expect(result._onTimeout).toBeDefined();
    });

    it("passes the result to the callback function", function (done) {
      describedClass.run(program, {}, 1, function (result) {
        expect(result).toEqual({ 1: true, 2: false, 3: false });
        done();
      });
    });

    it("passes each result to the callback function", function (done) {
      var results = [];

      describedClass.run(program, {}, 3, function (result) {
        results.push(result);

        if (results.length === 3) {
          expect(results).toEqual([
            { 1: true, 2: false, 3: false },
            { 1: false, 2: true, 3: false },
            { 1: false, 2: false, 3: false }
          ]);

          done();
        }
      });
    });

    it("it stops running if the solutions are exhausted", function (done) {
      var results = [];

      describedClass.run(program, {}, 99, function (result) {
        results.push(result);

        if (results.length === 5) {
          expect(results).toEqual([
            { 1: true, 2: false, 3: false },
            { 1: false, 2: true, 3: false },
            { 1: false, 2: false, 3: false },
            { 1: true, 2: true, 3: true },
            {}
          ]);
        }
      });

      // It stops callbacks after 5 results.
      setTimeout(function () {
        expect(results.length).toEqual(5);
        done();
      }, 100);
    });
  });

  it("throws an error if the problem size is missing", function () {
    expect(function () {
      describedClass.run({
        level1Variables: {},
        dimacs: SpecHelper.stripWhitespace("\n\
          -1 -2 3 0                         \n\
          1 -3 0                            \n\
          2 -3 0                            \n\
        ")
      }, {});
    }).toThrow();
  });
});
