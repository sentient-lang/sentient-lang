"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: -", function () {
  it("returns the sum", function () {
    var program = Sentient.compile("a = 1 - 2; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: -1 });

    program = Sentient.compile("a = -5 - -2 - 1; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: -4 });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = -(9, 4); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 5 });
  });
});
