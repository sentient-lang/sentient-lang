"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: odd?", function () {
  it("returns true if the integer is odd", function () {
    var program = Sentient.compile("a = 0.odd?; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 1.odd?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 2.odd?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = -1.odd?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -2.odd?; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
