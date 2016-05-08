"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: %", function () {
  it("returns the integer divisor", function () {
    var program = Sentient.compile("a = 9 % 4; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 1 });

    program = Sentient.compile("a = -100 % 8; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: 4 });
  });

  it("returns no solution if divisor is zero", function () {
    var program = Sentient.compile("a = 15 % 0; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({});
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = %(9, 4); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 1 });
  });
});
