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

  it("works correctly with dynamically scoped functions", function () {
    var program = Sentient.compile("         \n\
      foo = 2;                               \n\
      a = [1, 2, 3].countBy(function^ (x) {  \n\
        return x == foo;                     \n\
      });                                    \n\
      expose a;                              \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 1 }]);
  });

  it("works correctly with nils", function () {
    var program = Sentient.compile("\n\
      i = 0;                        \n\
      arr = [[10], [20, 30]][i];    \n\
      a = arr.countBy(*even?);      \n\
      b = arr.countBy(*odd?);       \n\
      expose a, b;                  \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 1, b: 0 }]);
  });
});
