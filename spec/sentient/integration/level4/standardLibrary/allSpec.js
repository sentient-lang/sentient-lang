"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: all?", function () {
  it("checks if all elements make the given function return true", function () {
    var program = Sentient.compile("a = [1, 3].all?(*odd?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = [1, 3, 4].all?(*odd?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false }]);
  });

  it("works correctly with dynamically scoped functions", function () {
    var program = Sentient.compile("      \n\
      foo = 3;                            \n\
      a = [3, 3, 3].all?(function^ (x) {  \n\
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
      a = arr.all?(function (x) {         \n\
        return x == 10;                   \n\
      });                                 \n\
      expose a;                           \n\
    ");

    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true }]);
  });
});
