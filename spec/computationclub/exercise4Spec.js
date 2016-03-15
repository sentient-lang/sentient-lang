"use strict";

var Sentient = require("../../lib/sentient");

describe("Exercise 4", function () {
  var machineCode = Sentient.compile({
    instructions: [
      // Add your instructions here.
    ]
  });

  it("can solve the subset sum problem", function () {
    var result = Sentient.run(machineCode, {
      numbers: [5, 8, 4, 11, 6],
      total: 20
    });

    expect(result.members).toEqual([
      true, false, true, true, false // 5, 4, 11
    ]);
  });

  it("can find a solution for 15", function () {
    var result = Sentient.run(machineCode, {
      numbers: [5, 8, 4, 11, 6],
      total: 15
    });

    expect(result.members).toEqual([
      true, false, true, false, true // 5, 4, 6
    ]);
  });

  it("does not find a solution for 7", function () {
    var result = Sentient.run(machineCode, {
      numbers: [5, 8, 4, 11, 6],
      total: 7
    });

    expect(result).toEqual({});
  });
});
