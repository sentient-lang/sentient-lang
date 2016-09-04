"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: push", function () {
  it("pushes an element onto the array", function () {
    var program = Sentient.compile("a = [1]; a = a.push(2); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1, 2] }]);

    program = Sentient.compile("a = []; a = a.push(2 + 2); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [4] }]);
  });

  it("does not mutate the original array", function () {
    var program = Sentient.compile("a = [1]; a.push(2); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1] }]);
  });

  it("works with arrays containing conditional nils", function () {
    var program = Sentient.compile("\n\
      i = 0;                        \n\
      arr = [[10], [20, 30]][i];    \n\
      arr = arr.push(123);          \n\
      expose arr;                   \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ arr: [10, 123] }]);
  });

  it("works with nested arrays", function () {
    var program = Sentient.compile("\n\
      arr = [[10], [20, 30]];       \n\
      arr = arr.push([40]);         \n\
      expose arr;                   \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ arr: [[10], [20, 30], [40]] }]);
  });

  it("works if the array is empty", function () {
    var program = Sentient.compile(" \n\
      arr = []; arr = arr.push(123); \n\
      expose arr;                    \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ arr: [123] }]);
  });

  it("allows empty arrays to be pushed onto nested arrays", function () {
    var program = Sentient.compile("\n\
      arr = [[1]];                  \n\
      arr = arr.push([]);           \n\
      expose arr;                   \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ arr: [[1], []] }]);

    program = Sentient.compile("    \n\
      arr = [[[1]]];                \n\
      arr = arr.push([]);           \n\
      expose arr;                   \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ arr: [[[1]], []] }]);

    program = Sentient.compile("    \n\
      arr = [[]];                   \n\
      arr = arr.push([]);           \n\
      x = 123;                      \n\
      expose arr, x;                \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ arr: [[], []], x: 123 }]);

    program = Sentient.compile("    \n\
      arr = [[]];                   \n\
      arr = arr.push([]);           \n\
      arr = arr.push([1]);          \n\
      expose arr;                   \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ arr: [[], [], [1]] }]);
  });

  it("throws an error on a type mismatch", function () {
    expect(function () {
      Sentient.compile("a = [1]; a = a.push(false);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [false]; a = a.push(1);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [1]; a = a.push([1]);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [false]; a = a.push([false]);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [[1]]; a = a.push(1);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [[false]]; a = a.push(false);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = []; a = a.push(1); a = a.push(false);");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [1]; a = a.push([]);");
    }).toThrow();

    expect(function () {
      Sentient.compile("     \n\
        a = [[]];            \n\
        a = a.push([]);      \n\
        a = a.push([1]);     \n\
        a = a.push([false]); \n\
      ");
    }).toThrow();
  });
});
