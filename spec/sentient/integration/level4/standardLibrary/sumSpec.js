"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: sum", function () {
  it("sums an array", function () {
    var program = Sentient.compile("a = [1, 2, 3].sum; expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 6 }]);
  });

  it("works with conditional nils", function () {
    var program = Sentient.compile("        \n\
      i = 0; a = [[10, 20], [30, 40, 50]];  \n\
      b = a[i].sum; expose b;               \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ b: 30 }]);
  });
});
