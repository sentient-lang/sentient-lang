"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: bounds?", function () {
  it("returns true if the index is within the bounds of the array", function () {
    var program = Sentient.compile("a = [1, 2].bounds?(0); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 2].bounds?(-1); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [1, 2].bounds?(2); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
