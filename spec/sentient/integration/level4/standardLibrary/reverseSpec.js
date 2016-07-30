"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: reverse", function () {
  it("reverses the array", function () {
    var program = Sentient.compile("a = [1, 2, 3].reverse; expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [3, 2, 1] }]);
  });

  it("works with nested arrays", function () {
    var program = Sentient.compile("a = [[10], [20, 30]].reverse; expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [[20, 30], [10]] }]);
  });

  it("works with conditional nils", function () {
    var program = Sentient.compile("    \n\
      i = 0;                            \n\
      a = [[10, 20], [30, 40, 50]][i];  \n\
      b = a.reverse;                    \n\
      expose b;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ b: [20, 10] }]);
  });

  it("does not cause a syntax error when chained with fetch", function () {
    var program = Sentient.compile("a = [1, 2, 3].reverse[0]; expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 3 }]);
  });
});
