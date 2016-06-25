"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: positive?", function () {
  it("returns true if the integer is positive", function () {
    var program = Sentient.compile("a = 2.positive?; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 1.positive?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 0.positive?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = -1.positive?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = -2.positive?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
