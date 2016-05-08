"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: if", function () {
  it("returns the branch corresponding to the condition", function () {
    var program = Sentient.compile("a = true.if(1, 2); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 1 });

    program = Sentient.compile("a = false.if(1, 2); vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: 2 });

    program = Sentient.compile("a = false.if(false, true); vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: true });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = if(true, 1, 2); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 1 });
  });

  it("can be called as a ternary", function () {
    var program = Sentient.compile("a = false ? 1 : 2; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 2 });
  });
});
