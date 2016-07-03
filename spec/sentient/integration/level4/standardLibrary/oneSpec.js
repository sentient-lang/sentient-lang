"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: one?", function () {
  it("checks if one element makes the given function return true", function () {
    var program = Sentient.compile("a = [1].one?(*even?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [1, 2].one?(*even?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 2, 4].one?(*even?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = [1, 2, 4, 6].one?(*even?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("works correctly with dynamically scoped functions", function () {
    var program = Sentient.compile("      \n\
      foo = 3;                            \n\
      a = [1, 2, 3].one?(function^ (x) {  \n\
        return x == foo;                  \n\
      });                                 \n\
      expose a;                           \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });

  it("works correctly with nils", function () {
    var program = Sentient.compile("      \n\
      i = 0;                              \n\
      arr = [[10], [20, 30]][i];          \n\
      a = arr.one?(function (x) {         \n\
        return x != 10;                   \n\
      });                                 \n\
      expose a;                           \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });
});
