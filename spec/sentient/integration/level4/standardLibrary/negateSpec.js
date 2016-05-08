"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: -@", function () {
  it("returns the negated integer", function () {
    var program = Sentient.compile("a = -5; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: -5 });

    program = Sentient.compile("a = -(-5); vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: 5 });
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a = -@(5); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: -5 });
  });
});