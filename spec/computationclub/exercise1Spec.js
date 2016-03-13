"use strict";

var Sentient = require("../../lib/sentient");

describe("Exercise 1", function () {
  var machineCode = Sentient.compile({
    instructions: [
      // Add your instructions here.
    ]
  });

  it("can calculate the value of 2 + 3", function () {
    var result = Sentient.run(machineCode, { a: 2, b: 3 });

    expect(result.total).toEqual(5);
  });

  it("can calculate the value of -10 + 21", function () {
    var result = Sentient.run(machineCode, { a: -10, b: 21 });

    expect(result.total).toEqual(11);
  });

  it("can find two numbers that add up to 100", function () {
    var result = Sentient.run(machineCode, { total: 100 });

    expect(result.a + result.b).toEqual(100);
  });

  it("can solve the equation 10 + b = 17", function () {
    var result = Sentient.run(machineCode, { a: 10, total: 17 });

    expect(result.b).toEqual(7);
  });
});
