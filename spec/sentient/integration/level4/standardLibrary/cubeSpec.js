"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: cube", function () {
  it("returns the cube of the integer", function () {
    var program = Sentient.compile("a = 3.cube; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 27 }]);

    program = Sentient.compile("a = -5.cube; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -125 }]);
  });
});
