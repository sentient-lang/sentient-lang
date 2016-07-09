"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: eachCons", function () {
  it("iterates through consecutive elements in an array", function () {
    var program = Sentient.compile("                  \n\
      aTotal = 0;                                     \n\
      bTotal = 0;                                     \n\
                                                      \n\
      [1, 2, 3, 4].eachCons(2, function^ (elements) { \n\
        aTotal += elements[0];                        \n\
        bTotal += elements[1];                        \n\
      });                                             \n\
                                                      \n\
      expose aTotal, bTotal;                          \n\
    ");
    var result = Sentient.run({ program: program });

    // Should iterate as: [1, 2], [2, 3], [3, 4]
    expect(result).toEqual([{ aTotal: 6, bTotal: 9 }]);
  });

  it("can iterate N items at a time", function () {
    var program = Sentient.compile("                  \n\
      aTotal = 0;                                     \n\
      bTotal = 0;                                     \n\
      cTotal = 0;                                     \n\
                                                      \n\
      [1, 2, 3, 4].eachCons(3, function^ (elements) { \n\
        aTotal += elements[0];                        \n\
        bTotal += elements[1];                        \n\
        cTotal += elements[2];                        \n\
      });                                             \n\
                                                      \n\
      expose aTotal, bTotal, cTotal;                  \n\
    ");
    var result = Sentient.run({ program: program });

    // Should iterate as: [1, 2, 3], [2, 3, 4]
    expect(result).toEqual([{ aTotal: 3, bTotal: 5, cTotal: 7 }]);
  });

  it("can pass an array of indexes to the function", function () {
    var program = Sentient.compile("                    \n\
      aIndexTotal = 0;                                  \n\
      bIndexTotal = 0;                                  \n\
                                                        \n\
      [1, 2, 3, 4].eachCons(2, function^ (e, indexes) { \n\
        aIndexTotal += indexes[0];                      \n\
        bIndexTotal += indexes[1];                      \n\
      });                                               \n\
                                                        \n\
      expose aIndexTotal, bIndexTotal;                  \n\
    ");
    var result = Sentient.run({ program: program });

    // Should iterate as: [0, 1], [1, 2], [2, 3]
    expect(result).toEqual([{ aIndexTotal: 3, bIndexTotal: 6 }]);
  });

  it("can pass an array of isPresent booleans to the function", function () {
    var program = Sentient.compile("                          \n\
      index = 0;                                              \n\
      myArray = [[10], [20, 30, 40]][index];                  \n\
      array4<bool> out;                                       \n\
      counter = 0;                                            \n\
                                                              \n\
      myArray.eachCons(2, function^ (e, i, isPresentArray) {  \n\
        invariant out[counter] == isPresentArray[0];          \n\
        counter += 1;                                         \n\
        invariant out[counter] == isPresentArray[1];          \n\
        counter += 1;                                         \n\
      });                                                     \n\
                                                              \n\
      expose out;                                             \n\
    ");
    var result = Sentient.run({ program: program });

    // Should iterate as: [10, nil], [nil, nil]
    expect(result).toEqual([{ out: [true, false, false, false] }]);
  });

  it("returns the original array", function () {
    var program = Sentient.compile("                      \n\
      a = [1, 2, 3].eachCons(2, function (elements) {});  \n\
      expose a;                                           \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });
});
