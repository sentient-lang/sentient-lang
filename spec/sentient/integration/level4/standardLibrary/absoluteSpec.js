"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: abs", function () {
  it("returns the absolute value of an integer", function () {
    var program = Sentient.compile("a = -5.abs; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: 5 }]);

    program = Sentient.compile("a = 5.abs; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 5 }]);

    program = Sentient.compile("a = 0.abs; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 0 }]);

    program = Sentient.compile("a = (7 * -3).abs; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 21 }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = abs(-5); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: 5 }]);
  });
});
