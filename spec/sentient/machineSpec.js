"use strict";

var describedClass = require("../../lib/sentient/machine");

describe("Machine", function () {
  it("runs the program, returning assignments for literals", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 3 3                            \n\
      -1 -2 3 0                            \n\
      1 -3 0                               \n\
      2 -3 0                               \n\
    ", { 3: true });

    expect(result).toEqual({ 1: true, 2: true, 3: true });
  });

  it("can be run with an empty set of assignments", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 3 3                            \n\
      -1 -2 3 0                            \n\
      1 -3 0                               \n\
      2 -3 0                               \n\
    ", {});

    expect(result).toEqual({ 1: true, 2: false, 3: false });
  });

  it("returns an empty object if there are no solutions", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 1 2                            \n\
      1 0                                  \n\
      -1 0                                 \n\
    ", {});

    expect(result).toEqual({});
  });

  it("can be run more than once to find multiple solutions", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 3 3                            \n\
      -1 -2 3 0                            \n\
      1 -3 0                               \n\
      2 -3 0                               \n\
    ", {}, 3);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false }
    ]);
  });

  it("it stops running if the solutions are exhausted", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 3 3                            \n\
      -1 -2 3 0                            \n\
      1 -3 0                               \n\
      2 -3 0                               \n\
    ", {}, 99);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false },
      { 1: true, 2: true, 3: true },
      {}
    ]);
  });

  it("runs until exhaustion when a count of '0' is specified", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 3 3                            \n\
      -1 -2 3 0                            \n\
      1 -3 0                               \n\
      2 -3 0                               \n\
    ", {}, 0);

    expect(result).toEqual([
      { 1: true, 2: false, 3: false },
      { 1: false, 2: true, 3: false },
      { 1: false, 2: false, 3: false },
      { 1: true, 2: true, 3: true },
      {}
    ]);
  });

  it("always returns an array if count is not equal to 1", function () {
    var result = describedClass.run("      \n\
      c Sentient Machine Code, Version 1.0 \n\
      c {                                  \n\
      c }                                  \n\
      p cnf 1 2                            \n\
      1 0                                  \n\
      -1 0                                 \n\
    ", {}, 2);

    expect(result).toEqual([{}]);
  });

  it("throws an error if the header is missing", function () {
    expect(function () {
      describedClass.run("                   \n\
        c Sentient Machine Code, Version 1.0 \n\
        c {                                  \n\
        c }                                  \n\
        -1 -2 3 0                            \n\
        1 -3 0                               \n\
        2 -3 0                               \n\
      ", {});
    }).toThrow();
  });
});
