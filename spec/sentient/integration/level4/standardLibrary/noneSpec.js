"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: none?", function () {
  it("checks if no element makes the given function return true", function () {
    var program = Sentient.compile("a = [1, 3].none?(*even?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 2].none?(*even?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("works correctly with dynamically scoped functions", function () {
    var program = Sentient.compile("      \n\
      foo = 3;                            \n\
      a = [1, 2, 3].none?(function^ (x) { \n\
        return x == foo;                  \n\
      });                                 \n\
      expose a;                           \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("works correctly with nils", function () {
    var program = Sentient.compile("      \n\
      i = 0;                              \n\
      arr = [[10], [20, 30]][i];          \n\
      a = arr.none?(function (x) {        \n\
        return x != 10;                   \n\
      });                                 \n\
      expose a;                           \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });
});
