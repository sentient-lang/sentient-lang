"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: eachCons", function () {
  it("iterates through slices of an array", function () {
    var program = Sentient.compile("           \n\
      array2<array2<int>> elements;            \n\
      counter = 0;                             \n\
                                               \n\
      [1, 2, 3].eachSlice(2, function^ (e) {   \n\
        invariant elements[counter] == e;      \n\
        counter += 1;                          \n\
      });                                      \n\
                                               \n\
      expose elements;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ elements: [[1, 2], [3, -1]] }]);
  });

  it("can iterate N items at a time", function () {
    var program = Sentient.compile("           \n\
      array1<array3<int>> elements;            \n\
      counter = 0;                             \n\
                                               \n\
      [1, 2, 3].eachSlice(3, function^ (e) {   \n\
        invariant elements[counter] == e;      \n\
        counter += 1;                          \n\
      });                                      \n\
                                               \n\
      expose elements;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ elements: [[1, 2, 3]] }]);
  });

  it("iterates through boolean arrays", function () {
    var program = Sentient.compile("                    \n\
      array2<array2<bool>> elements;                    \n\
      counter = 0;                                      \n\
                                                        \n\
      [true, true, true].eachSlice(2, function^ (e) {   \n\
        invariant elements[counter] == e;               \n\
        counter += 1;                                   \n\
      });                                               \n\
                                                        \n\
      expose elements;                                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ elements: [[true, true], [true, false]] }]);
  });

  it("iterates through nested arrays", function () {
    var program = Sentient.compile("                     \n\
      array2<array2<array1<int>>> elements;              \n\
      counter = 0;                                       \n\
                                                         \n\
      [[1], [2], [3], [4]].eachSlice(2, function^ (e) {  \n\
        invariant elements[counter] == e;                \n\
        counter += 1;                                    \n\
      });                                                \n\
                                                         \n\
      expose elements;                                   \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ elements: [[[1], [2]], [[3], [4]]] }]);
  });

  it("can pass an array of indexes to the function", function () {
    var program = Sentient.compile("             \n\
      array2<array2<int>> indexes;               \n\
      counter = 0;                               \n\
                                                 \n\
      [1, 2, 3].eachSlice(2, function^ (e, i) {  \n\
        invariant indexes[counter] == i;         \n\
        counter += 1;                            \n\
      });                                        \n\
                                                 \n\
      expose indexes;                            \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ indexes: [[0, 1], [2, -1]] }]);
  });

  it("can pass an array of presence booleans to the function", function () {
    var program = Sentient.compile("                          \n\
      index = 0;                                              \n\
      myArray = [[10], [20, 30, 40]][index];                  \n\
      array2<array2<bool>> presence;                          \n\
      counter = 0;                                            \n\
                                                              \n\
      myArray.eachCons(2, function^ (e, i, p) {               \n\
        invariant presence[counter] == p;                     \n\
        counter += 1;                                         \n\
      });                                                     \n\
                                                              \n\
      expose presence;                                        \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ presence: [[true, false], [false, false]] }]);
  });

  it("returns the original array", function () {
    var program = Sentient.compile("                       \n\
      a = [1, 2, 3].eachSlice(2, function (elements) {});  \n\
      expose a;                                            \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });
});
