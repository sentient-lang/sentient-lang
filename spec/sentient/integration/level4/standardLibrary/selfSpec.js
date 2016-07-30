"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: self", function () {
  it("returns the object it is called on", function () {
    var program = Sentient.compile("a = 3.self; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 3 }]);

    program = Sentient.compile("   \n\
      i = 0; a = [[10], [20, 30]]; \n\
      b = a[i].self;               \n\
      expose b;                    \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ b: [10] }]);
  });
});
