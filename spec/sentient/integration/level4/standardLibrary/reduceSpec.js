"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: reduce", function () {
  it("reduces the array with the provided function", function () {
    var program = Sentient.compile("a = [1, 2, 3].reduce(*+); expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 6 }]);
  });

  it("can specify an initial value", function () {
    var program = Sentient.compile("a = [1, 2, 3].reduce(10, *+); expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 16 }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("                   \n\
      a = [1, 2, 3].reduce(function (acc, n, index) {  \n\
        return acc + n * index;                        \n\
      });                                              \n\
      expose a;                                        \n\
    ");
    var result = Sentient.run({ program: program });

    // 1 + (2 * 1) + (3 * 2)
    expect(result).toEqual([{ a: 9 }]);
  });

  it("can optionally take the 'isPresent' argument", function () {
    var program = Sentient.compile("                       \n\
      i = 0;                                               \n\
      arr = [[10], [20, 30]][i];                           \n\
                                                           \n\
      a = arr.reduce(0, function (acc, n, i, isPresent) {  \n\
        return acc + isPresent.if(n, 1);                   \n\
      });                                                  \n\
                                                           \n\
      expose a;                                            \n\
    ");
    var result = Sentient.run({ program: program });

    // 10 (present=true) + 1 (present=false)
    expect(result).toEqual([{ a: 11 }]);
  });

  it("works with multiplication", function () {
    var program = Sentient.compile("a = [2, 3, 4].reduce(**); expose a;");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 24 }]);
  });
});
