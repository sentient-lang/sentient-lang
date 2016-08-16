"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: reject", function () {
  it("rejects elements where the function returns true", function () {
    var program = Sentient.compile("a = [1, 2, 3].reject(*even?); expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1, 3] }]);

    program = Sentient.compile("a = [1, 2, 3].reject(*odd?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [2] }]);

    program = Sentient.compile("a = [1, 2, 3].reject(*zero?); expose a;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });

  it("works for nested arrays", function () {
    var program = Sentient.compile("                             \n\
      a = [[], [1], [2], [3, 4], [5, 6]].reject(function (arr) { \n\
        return arr.length == 1;                                  \n\
      });                                                        \n\
      expose a;                                                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [[], [3, 4], [5, 6]] }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("                   \n\
      a = [1, 2, 3].reject(function (element, index) { \n\
        return element == 3 || index == 1;             \n\
      });                                              \n\
      expose a;                                        \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [1] }]);
  });

  it("can optionally take the 'isPresent' argument", function () {
    var program = Sentient.compile("                        \n\
      i = 0;                                                \n\
      arr = [[10, 20], [30, 40, 50]][i];                    \n\
      a = arr.reject(function (element, index, isPresent) { \n\
        return isPresent && element != 10;                  \n\
      });                                                   \n\
      expose a;                                             \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [10, -1] }]);
  });

  it("does not carry nil conditions forward", function () {
    var program = Sentient.compile("                        \n\
      i = 0;                                                \n\
      arr = [[10, 20], [30, 40, 50]][i];                    \n\
      a = arr.reject(function (element, index, isPresent) { \n\
        return element != -1;                               \n\
      });                                                   \n\
      expose a;                                             \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [-1] }]);
  });

  it("returns an empty array for an empty array", function () {
    var program = Sentient.compile("a = [].reject(*even?);b = 1; expose a, b;");
    var result = Sentient.run({ program: program });
    expect(result[0].a).toEqual([]);
  });

  it("throws an error if not called on an array", function () {
    expect(function () {
      Sentient.compile("a = 1.reject(*even?);");
    }).toThrow();
  });

  it("throws an error if the function takes no arguments", function () {
    expect(function () {
      Sentient.compile("a = [1].reject(function () {});");
    }).toThrow();
  });

  it("throws an error if the function takes 4 arguments", function () {
    expect(function () {
      Sentient.compile("a = [1].reject(function (a, b, c, d) {});");
    }).toThrow();
  });

  it("throws an error if the function returns 0 things", function () {
    expect(function () {
      Sentient.compile("a = [1].reject(function (a) {});");
    }).toThrow();
  });

  it("throws an error if the function returns 2 things", function () {
    expect(function () {
      Sentient.compile("a = [1].reject(function (a) { return 1, 2; });");
    }).toThrow();
  });
});
