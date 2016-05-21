"use strict";

var machine = "../../../lib/sentient/machine";
var describedClass = require(machine + "/lingelingAdapter");

describe("LingelingAdapter", function () {
  it("returns an array of literals if the solve is successful", function () {
    var result = describedClass.solve("\n\
      p cnf 3 5                        \n\
      -1 -2 3 0                        \n\
      1 -3 0                           \n\
      2 -3 0                           \n\
      -1 0                             \n\
      2 0                              \n\
    ");

    expect(result).toEqual([-1, 2, -3]);
  });

  it("returns an empty array if the solve is unsuccessful", function () {
    var result = describedClass.solve("\n\
      p cnf 1 2                        \n\
      1 0                              \n\
      -1 0                             \n\
    ");

    expect(result).toEqual([]);
  });

  it("throws an error if the input is not well-formed", function () {
    expect(function () {
      describedClass.solve("nonsense");
    }).toThrow();
  });

  it("throws an error if the input is missing the header", function () {
    expect(function () {
      describedClass.solve("1 0");
    }).toThrow();
  });

  it("throws an error if the binary cannot be found", function () {
    expect(function () {
      new describedClass("does_not_exist", "p cnf 1 1\n1 0").solve();
    }).toThrow();
  });

  it("throws an error if lingeling writes to stderr", function () {
    expect(function () {
      describedClass.solve("\n\
        p cnf 1 1           \n\
        -0 1                \n\
      ");
    }).toThrow();
  });

  it("copes with an edge case where 'v 0' is on a line by itself", function () {
    var result = describedClass.solve("\n\
      p cnf 29 29 \n\
      1 0         \n\
      2 0         \n\
      3 0         \n\
      4 0         \n\
      5 0         \n\
      6 0         \n\
      7 0         \n\
      8 0         \n\
      9 0         \n\
      10 0        \n\
      11 0        \n\
      12 0        \n\
      13 0        \n\
      14 0        \n\
      15 0        \n\
      16 0        \n\
      17 0        \n\
      18 0        \n\
      19 0        \n\
      20 0        \n\
      21 0        \n\
      22 0        \n\
      23 0        \n\
      24 0        \n\
      25 0        \n\
      26 0        \n\
      27 0        \n\
      28 0        \n\
      29 0        \n\
    ");

    for (var i = 0; i < result.length; i += 1) {
      expect(result[i]).not.toEqual(0);
    }
  });
});
