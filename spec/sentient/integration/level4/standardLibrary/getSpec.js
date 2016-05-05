"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: get", function () {
  it("gets the element at index and a bounds-check boolean", function () {
    var program = Sentient.compile("a, aNil = [1, 2].get(1); vary a, aNil;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 2, aNil: false });

    program = Sentient.compile("a, aNil = [1, 2].get(2); vary a, aNil;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: 0, aNil: true });

    program = Sentient.compile("a, aNil = [true].get(0); vary a, aNil;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: true, aNil: false });

    program = Sentient.compile("a, aNil = [true].get(-1); vary a, aNil;");
    result = Sentient.run(program);
    expect(result).toEqual({ a: false, aNil: true });
  });

  it("can be called as a function instead of a method", function () {
    var program = Sentient.compile("a, aNil = get([1], 0); vary a, aNil;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 1, aNil: false });
  });
});
