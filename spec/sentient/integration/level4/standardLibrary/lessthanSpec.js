"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: <", function () {
  it("returns a < b", function () {
    var program = Sentient.compile("a = 1 < 2; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: true });

    program = Sentient.compile("a = 0 < -3; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = 2 < 2; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = <(9, 4); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: false });
  });
});
