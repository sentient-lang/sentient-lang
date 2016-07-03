"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: succ", function () {
  it("returns the integer's successor", function () {
    var program = Sentient.compile("a = 1.succ; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2 }]);

    program = Sentient.compile("a = -4.succ; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -3 }]);
  });

  it("has an alias 'next'", function () {
    var program = Sentient.compile("a = 1.next; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2 }]);
  });
});
