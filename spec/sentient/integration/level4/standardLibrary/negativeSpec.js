"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: negative?", function () {
  it("returns true if the integer is negative", function () {
    var program = Sentient.compile("a = 2.negative?; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 1.negative?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 0.negative?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = -1.negative?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -2.negative?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });
});
