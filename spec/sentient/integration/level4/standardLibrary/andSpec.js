"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: &&", function () {
  it("returns a && b", function () {
    var program = Sentient.compile("a = true && true; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: true });

    program = Sentient.compile("a = true && false; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = true && false; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = false && false; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a = &&(true, false); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: false });
  });
});
