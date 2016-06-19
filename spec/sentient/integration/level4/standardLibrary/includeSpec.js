"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: include?", function () {
  it("returns true if the array includes the element", function () {
    var program = Sentient.compile("a = [1, 2, 3].include?(1); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 2, 3].include?(3); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 2, 3].include?(0); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [1, 2, 3].include?(4); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [[1, 2], [3]].include?([1, 2]); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [[1, 2], [3]].include?([1, 3]); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
