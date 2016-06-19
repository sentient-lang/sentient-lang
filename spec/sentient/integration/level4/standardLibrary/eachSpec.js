"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: each", function () {
  it("iterates through an array and calls the provided function", function () {
    var program = Sentient.compile("        \n\
      total = 0;                            \n\
                                            \n\
      each([1, 2, 3], function^ (element) { \n\
        total += element;                   \n\
      });                                   \n\
                                            \n\
      expose total;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ total: 6 }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("               \n\
      array3<int> elements;                        \n\
                                                   \n\
      each([1, 2, 3], function^ (element, index) { \n\
        invariant elements[index] == element;      \n\
      });                                          \n\
                                                   \n\
      expose elements;                             \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ elements: [1, 2, 3] }]);
  });

  it("can optionally take the 'isPresent' argument", function () {
    var program = Sentient.compile("                                    \n\
      array2<bool> presence;                                            \n\
                                                                        \n\
      each([[10], [20, 30]][0], function^ (element, index, isPresent) { \n\
        invariant presence[index] == isPresent;                         \n\
      });                                                               \n\
                                                                        \n\
      expose presence;                                                  \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ presence: [true, false] }]);
  });

  it("can take a predefined function", function () {
    var program = Sentient.compile("        \n\
      total = 0;                            \n\
                                            \n\
      function^ add_to_total (element) {    \n\
        total += element;                   \n\
      };                                    \n\
                                            \n\
      each([1, 2, 3], *add_to_total);       \n\
                                            \n\
      expose total;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ total: 6 }]);
  });

  it("returns the original array", function () {
    var program = Sentient.compile("        \n\
      a = each([1, 2, 3], function (e) {}); \n\
      expose a;                             \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("        \n\
      total = 0;                            \n\
                                            \n\
      [1, 2, 3].each(function^ (element) {  \n\
        total += element;                   \n\
      });                                   \n\
                                            \n\
      expose total;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ total: 6 }]);
  });

  it("provides a reasonable interface to allow chaining", function () {
    var program = Sentient.compile("        \n\
      total = 0;                            \n\
                                            \n\
      [1, 2, 3].each(                       \n\
        function^ (e) { total += e; }       \n\
      ).each(                               \n\
        function^ (e) { total += e; }       \n\
      ).each(                               \n\
        function^ (e) { total += e; }       \n\
      );                                    \n\
                                            \n\
      expose total;                         \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ total: 18 }]);
  });
});
