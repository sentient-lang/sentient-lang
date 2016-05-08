"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: /", function () {
  it("returns the integer division", function () {
    var program = Sentient.compile("a = 9 / 4; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 2 });

    program = Sentient.compile("a = 50 / 2 / -4; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: -6 });
  });

  it("returns no solution if divisor is zero", function () {
    var program = Sentient.compile("a = 15 / 0; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({});
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a = /(9, 4); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 2 });
  });
});