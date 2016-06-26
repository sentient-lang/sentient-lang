"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: square", function () {
  it("returns the square of the integer", function () {
    var program = Sentient.compile("a = 3.square; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 9 }]);

    program = Sentient.compile("a = -5.square; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 25 }]);
  });
});
