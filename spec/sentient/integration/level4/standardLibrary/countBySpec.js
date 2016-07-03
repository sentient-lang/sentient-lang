"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: countBy", function () {
  it("count the elements with a true function return value", function () {
    var program = Sentient.compile("a = [1, 2, 3].countBy(*even?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 1 }]);

    program = Sentient.compile("a = [1, 2, 3].countBy(*odd?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2 }]);

    program = Sentient.compile("a = [1, 2, 3].countBy(*zero?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 0 }]);
  });
});
