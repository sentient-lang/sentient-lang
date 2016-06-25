"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: even?", function () {
  it("returns true if the integer is even", function () {
    var program = Sentient.compile("a = 0.even?; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 1.even?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 2.even?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -1.even?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = -2.even?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });
});
