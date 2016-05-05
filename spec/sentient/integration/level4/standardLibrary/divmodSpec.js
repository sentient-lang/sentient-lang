"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: divmod", function () {
  it("returns the integer division and modulo", function () {
    var program = Sentient.compile("div, mod = 9.divmod(4); vary div, mod;");
    var result = Sentient.run(program);
    expect(result).toEqual({ div: 2, mod: 1 });

    program = Sentient.compile("div, mod = -100.divmod(8); vary div, mod;");
    result = Sentient.run(program);
    expect(result).toEqual({ div: -13, mod: 4 });
  });

  it("returns no solution if divisor is zero", function () {
    var program = Sentient.compile("div, mod = 15.divmod(0); vary div, mod;");
    var result = Sentient.run(program);
    expect(result).toEqual({});
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("div, mod = divmod(9, 4); vary div, mod;");
    var result = Sentient.run(program);
    expect(result).toEqual({ div: 2, mod: 1 });
  });
});
