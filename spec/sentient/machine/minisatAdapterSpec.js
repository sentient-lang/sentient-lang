"use strict";

var machine = "../../../lib/sentient/machine";
var describedClass = require(machine + "/minisatAdapter");

describe("MinisatAdapter", function () {
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

  it("throws an error if the path cannot be found", function () {
    expect(function () {
      new describedClass("does_not_exist", "p cnf 1 1\n1 0").solve();
    }).toThrow();
  });
});
