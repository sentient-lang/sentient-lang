"use strict";

var Sentient = require("../../lib/sentient");

describe("Exercise 3", function () {
  var machineCode = Sentient.compile({
    instructions: [
      // Add your instructions here.
    ]
  });

  it("can solve the equation x^2 + y^2 = z^2", function () {
    var result = Sentient.run(machineCode, { z: 5 });

    expect(result.x * result.x + result.y * result.y).toEqual(5 * 5);
  });

  it("does not find any solutions when x=0 or y=0", function () {
    var result = Sentient.run(machineCode, { x: 0 });
    expect(result).toEqual({});

    result = Sentient.run(machineCode, { y: 0 });
    expect(result).toEqual({});
  });

  it("can find a solution for z=277", function () {
    var result = Sentient.run(machineCode, { z: 277 });

    expect(result.x * result.x + result.y * result.y).toEqual(277 * 277);
  });
});
