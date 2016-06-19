"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: divmod", function () {
  it("returns the integer division and modulo", function () {
    var program = Sentient.compile("div, mod = 9.divmod(4); expose div, mod;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ div: 2, mod: 1 }]);

    program = Sentient.compile("div, mod = -100.divmod(8); expose div, mod;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ div: -13, mod: 4 }]);
  });

  it("returns no solution if divisor is zero", function () {
    var program = Sentient.compile("div, mod = 15.divmod(0); expose div, mod;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{}]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("div, mod = divmod(9, 4); expose div, mod;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ div: 2, mod: 1 }]);
  });
});
