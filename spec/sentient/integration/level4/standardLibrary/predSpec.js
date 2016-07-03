"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: pred", function () {
  it("returns the integer's predecessor", function () {
    var program = Sentient.compile("a = 1.pred; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 0 }]);

    program = Sentient.compile("a = -4.pred; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -5 }]);
  });

  it("has an alias 'prev'", function () {
    var program = Sentient.compile("a = 1.prev; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 0 }]);
  });
});
