"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: uniq?", function () {
  it("returns true if the array contains unique elements", function () {
    var program = Sentient.compile("a = uniq?([1, 2, 3]); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: true });

    program = Sentient.compile("a = uniq?([1, 2, 2]); expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = uniq?([1, 1, 3]); expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = uniq?([0, 0, 0]); expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = uniq?([true, true]); expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false });

    program = Sentient.compile("a = uniq?([[1], [2]]); expose a;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: true });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = [-1, 0, 1].uniq?; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: true });
  });
});
