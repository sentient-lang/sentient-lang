"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: <=", function () {
  it("returns a <= b", function () {
    var program = Sentient.compile("a = 1 <= 2; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 0 <= -3; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 2 <= 2; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = <=(9, 4); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
