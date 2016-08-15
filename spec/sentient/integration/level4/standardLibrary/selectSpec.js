"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: select", function () {
  it("selection elements where the function returns true", function () {
    var program = Sentient.compile("a = [1, 2, 3].select(*even?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [2] }]);

    program = Sentient.compile("a = [1, 2, 3].select(*odd?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1, 3] }]);

    program = Sentient.compile("a = [1, 2, 3].select(*zero?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [] }]);
  });

  it("works for nested arrays", function () {
    var program = Sentient.compile("                             \n\
      a = [[], [1], [2], [3, 4], [5, 6]].select(function (arr) { \n\
        return arr.length == 1;                                  \n\
      });                                                        \n\
      expose a;                                                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [[1], [2]] }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("                   \n\
      a = [1, 2, 3].select(function (element, index) { \n\
        return element == 3 || index == 1;             \n\
      });                                              \n\
      expose a;                                        \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [2, 3] }]);
  });

  it("can optionally take the 'isPresent' argument", function () {
    var program = Sentient.compile("                        \n\
      i = 0;                                                \n\
      arr = [[10, 20], [30, 40, 50]][i];                    \n\
      a = arr.select(function (element, index, isPresent) { \n\
        return isPresent && element != 10;                  \n\
      });                                                   \n\
      expose a;                                             \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [20] }]);
  });

  it("does not carry nil conditions forward", function () {
    var program = Sentient.compile("                        \n\
      i = 0;                                                \n\
      arr = [[10, 20], [30, 40, 50]][i];                    \n\
      a = arr.select(function (element, index, isPresent) { \n\
        return element != 10;                               \n\
      });                                                   \n\
      expose a;                                             \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [20, -1] }]);
  });

  it("returns an empty array for an empty array", function () {
    var program = Sentient.compile("a = [].select(*even?);b = 1; expose a, b;");
    var result = Sentient.run({ program: program });
    expect(result[0].a).toEqual([]);
  });

  it("throws an error if not called on an array", function () {
    expect(function () {
      Sentient.compile("a = 1.select(*even?);");
    }).toThrow();
  });

  it("throws an error if the function takes no arguments", function () {
    expect(function () {
      Sentient.compile("a = [1].select(function () {});");
    }).toThrow();
  });

  it("throws an error if the function takes 4 arguments", function () {
    expect(function () {
      Sentient.compile("a = [1].select(function (a, b, c, d) {});");
    }).toThrow();
  });

  it("throws an error if the function returns 0 things", function () {
    expect(function () {
      Sentient.compile("a = [1].select(function (a) {});");
    }).toThrow();
  });

  it("throws an error if the function returns 2 things", function () {
    expect(function () {
      Sentient.compile("a = [1].select(function (a) { return 1, 2; });");
    }).toThrow();
  });
});
