"use strict";

var Sentient = require("../../lib/sentient");

describe("Exercise 2", function () {
  var machineCode = Sentient.compile({
    instructions: [
      // Add your instructions here.
    ]
  });

  it("can solve the equation x^2 + y^2 = 90", function () {
    var result = Sentient.run(machineCode, {});

    expect(result.x * result.x + result.y * result.y).toEqual(90);
  });

  it("can find a solution when x=-3", function () {
    var result = Sentient.run(machineCode, { x: -3 });

    expect((-3 * -3) + result.y * result.y).toEqual(90);
  });

  it("does not find any solutions when x=1", function () {
    var result = Sentient.run(machineCode, { x: 1 });

    expect(result).toEqual({});
  });
});
