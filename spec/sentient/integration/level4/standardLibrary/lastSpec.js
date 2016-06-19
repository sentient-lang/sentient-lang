"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: last", function () {
  it("returns the last element in an array", function () {
    var program = Sentient.compile("a = [2, 3].last; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 3 }]);

    program = Sentient.compile("a = [false, true].last; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [[10, 20], [30]].last; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [30] }]);

    program = Sentient.compile("a = [[10, 20], [30]].last.last; expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 30 }]);
  });
});
