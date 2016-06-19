"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: first", function () {
  it("returns the first element in an array", function () {
    var program = Sentient.compile("a = [2, 3].first; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2 }]);

    program = Sentient.compile("a = [false, true].first; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [[10, 20], [30]].first; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [10, 20] }]);
  });
});
