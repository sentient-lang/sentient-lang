"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: *", function () {
  it("returns the multiplication", function () {
    var program = Sentient.compile("a = 3 * 4; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 12 });

    program = Sentient.compile("a = -3 * 4 * 5; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: -60 });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = *(3, 4); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 12 });
  });
});
