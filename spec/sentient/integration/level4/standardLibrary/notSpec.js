"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: !@", function () {
  it("returns the opposite boolean", function () {
    var program = Sentient.compile("a = !true; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = !false; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: true });
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a = !@(true); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: false });
  });
});
