"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: []", function () {
  it("fetches elements from an integer array", function () {
    var program = Sentient.compile("\n\
      arr = [1, 2, 3];              \n\
                                    \n\
      a = arr[0];                   \n\
      b = arr[1];                   \n\
      c = arr[2];                   \n\
                                    \n\
      expose a, b, c;               \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 1, b: 2, c: 3 }]);
  });

  it("fetches elements from a boolean array", function () {
    var program = Sentient.compile("\n\
      arr = [true, false];          \n\
                                    \n\
      a = arr[0];                   \n\
      b = arr[1];                   \n\
                                    \n\
      expose a, b;                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: true, b: false }]);
  });

  it("fetches elements from nested arrays", function () {
    var program = Sentient.compile("\n\
      arr = [[10], [20, 30]];       \n\
                                    \n\
      a = arr[0][0];                \n\
      b = arr[1][0];                \n\
      c = arr[1][1];                \n\
                                    \n\
      expose a, b, c;               \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 10, b: 20, c: 30 }]);
  });

  it("returns no solution if index is out-of-bounds", function () {
    var program = Sentient.compile("\n\
      x = -1;                       \n\
      a = [1, 2, 3][x];             \n\
      expose a;                     \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{}]);

    program = Sentient.compile("\n\
      x = 3;                    \n\
      a = [1, 2, 3][x];         \n\
      expose a;                 \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{}]);

    program = Sentient.compile("  \n\
      x, y = 0, 1;                \n\
      a = [[10], [20, 30]][x][y]; \n\
      expose a;                   \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{}]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = []([1, 2, 3], 1); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2 }]);
  });
});
