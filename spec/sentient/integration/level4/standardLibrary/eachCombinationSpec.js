"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: eachCombination", function () {
  it("iterates through an array and calls the provided function", function () {
    var program = Sentient.compile("                       \n\
      array3<array2<int>> combinations;                    \n\
      counter = 0;                                         \n\
                                                           \n\
      eachCombination([1, 2, 3], 2, function^ (elements) { \n\
        invariant combinations[counter] == elements;       \n\
        counter += 1;                                      \n\
      });                                                  \n\
                                                           \n\
      expose combinations;                                 \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ combinations: [[1, 2], [1, 3], [2, 3]] }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("                   \n\
      array3<array2<int>> indexes;                     \n\
      counter = 0;                                     \n\
                                                       \n\
      eachCombination([1, 2, 3], 2, function^ (e, i) { \n\
        invariant indexes[counter] == i;               \n\
        counter += 1;                                  \n\
      });                                              \n\
                                                       \n\
      expose indexes;                                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ indexes: [[0, 1], [0, 2], [1, 2]] }]);
  });

  it("can take a predefined function", function () {
    var program = Sentient.compile("                 \n\
      total = 0;                                     \n\
                                                     \n\
      function^ add_to_total (elements) {            \n\
        total += elements[0];                        \n\
        total += elements[1];                        \n\
      };                                             \n\
                                                     \n\
      eachCombination([1, 2, 3], 2, *add_to_total);  \n\
                                                     \n\
      expose total;                                  \n\
    ");
    var result = Sentient.run({ program: program });

    // [[1, 2], [1, 3], [2, 3]]
    expect(result).toEqual([{ total: 12 }]);
  });

  it("returns the original array", function () {
    var program = Sentient.compile("                      \n\
      a = eachCombination([1, 2, 3], 2, function (e) {}); \n\
      expose a;                                           \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });
});
