"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: between?", function () {
  it("returns true if the number is in between the two provided", function () {
    var program = Sentient.compile("a = 5.between?(1, 9); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 0.between?(1, 9); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 10.between?(1, 9); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("includes the fence posts", function () {
    var program = Sentient.compile("a = 1.between?(1, 9); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = 9.between?(1, 9); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });

  it("works for negatives", function () {
    var program = Sentient.compile("a = -3.between?(-9, -1); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -10.between?(-9, -1); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("works when the fence posts are the other way round", function () {
    var program = Sentient.compile("a = 5.between?(9, 1); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = -3.between?(-1, -9); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });
});
