"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: +", function () {
  it("returns the sum", function () {
    var program = Sentient.compile("a = 1 + 2; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 3 });

    program = Sentient.compile("a = -5 + -2 + 1; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: -6 });
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a = +(9, 4); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 13 });
  });
});
