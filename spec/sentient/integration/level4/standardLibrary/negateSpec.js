"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: -@", function () {
  it("returns the negated integer", function () {
    var program = Sentient.compile("a = -5; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -5 }]);

    program = Sentient.compile("a = -(-5); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 5 }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = -@(5); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -5 }]);
  });
});
