"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: eachPair", function () {
  it("iterates through an array and calls the provided function", function () {
    var program = Sentient.compile("                     \n\
      leftTotal = 0;                                     \n\
      rightTotal = 0;                                    \n\
                                                         \n\
      eachPair([1, 2, 3, 4], function^ (left, right) {   \n\
        leftTotal += left;                               \n\
        rightTotal += right;                             \n\
      });                                                \n\
                                                         \n\
      expose leftTotal, rightTotal;                      \n\
    ");
    var result = Sentient.run(program);

    // Should iterate as: [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]
    expect(result).toEqual([{ leftTotal: 10, rightTotal: 20 }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("                             \n\
      leftIndexTotal = 0;                                        \n\
      rightIndexTotal = 0;                                       \n\
                                                                 \n\
      eachPair([1, 2, 3, 4], function^ (l, r, lIndex, rIndex) {  \n\
        leftIndexTotal += lIndex;                                \n\
        rightIndexTotal += rIndex;                               \n\
      });                                                        \n\
                                                                 \n\
      expose leftIndexTotal, rightIndexTotal;                    \n\
    ");
    var result = Sentient.run(program);

    // Should iterate as: [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    expect(result).toEqual([{ leftIndexTotal: 4, rightIndexTotal: 14 }]);
  });

  it("can take a predefined function", function () {
    var program = Sentient.compile("                     \n\
      total = 0;                                         \n\
                                                         \n\
      function^ add_to_total (left, right) {             \n\
        total += left;                                   \n\
        total += right;                                  \n\
      };                                                 \n\
                                                         \n\
      eachPair([1, 2, 3, 4], *add_to_total);             \n\
                                                         \n\
      expose total;                                      \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ total: 30 }]);
  });

  it("returns the original array", function () {
    var program = Sentient.compile("                  \n\
      a = eachPair([1, 2, 3, 4], function (l, r) {}); \n\
      expose a;                                       \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: [1, 2, 3, 4] }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("                   \n\
      leftTotal = 0;                                   \n\
      rightTotal = 0;                                  \n\
                                                       \n\
      [1, 2, 3, 4].eachPair(function^ (left, right) {  \n\
        leftTotal += left;                             \n\
        rightTotal += right;                           \n\
      });                                              \n\
                                                       \n\
      expose leftTotal, rightTotal;                    \n\
    ");
    var result = Sentient.run(program);

    // Should iterate as: [1, 2], [1, 3], [1, 4], [2, 3], [2, 4], [3, 4]
    expect(result).toEqual([{ leftTotal: 10, rightTotal: 20 }]);
  });

  it("provides a reasonable interface to allow chaining", function () {
    var program = Sentient.compile("        \n\
      total = 0;                            \n\
                                            \n\
      [1, 2, 3, 4].eachPair(                \n\
        function^ (l, r) { total += l; }    \n\
      ).eachPair(                           \n\
        function^ (l, r) { total += r; }    \n\
      );                                    \n\
                                            \n\
      expose total;                         \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ total: 30 }]);
  });
});
