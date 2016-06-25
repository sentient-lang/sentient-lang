"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: zero?", function () {
  it("returns true if the integer is equal to zero", function () {
    var program = Sentient.compile("a = 1.zero?; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 0.zero?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -1.zero?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
