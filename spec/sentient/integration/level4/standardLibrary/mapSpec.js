"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: map", function () {
  it("maps over the array with the provided function", function () {
    var program = Sentient.compile("        \n\
      mapped = [1, 2, 3].map(function (e) { \n\
        return 2 * e;                       \n\
      });                                   \n\
                                            \n\
      expose mapped;                        \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ mapped: [2, 4, 6] }]);
  });

  it("can optionally take the current index", function () {
    var program = Sentient.compile("           \n\
      mapped = [1, 2, 3].map(function (e, i) { \n\
        return e * i;                          \n\
      });                                      \n\
                                               \n\
      expose mapped;                           \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ mapped: [0, 2, 6] }]);
  });

  it("preserves nils from the original array", function () {
    var program = Sentient.compile("           \n\
      i = 0;                                   \n\
      arr = [[10], [20, 30]][i];               \n\
                                               \n\
      mapped = arr.map(function (e) {          \n\
        return 2 * e;                          \n\
      });                                      \n\
                                               \n\
      expose mapped;                           \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ mapped: [20] }]);
  });

  it("provides a reasonable interface to allow chaining", function () {
    var program = Sentient.compile("        \n\
      mapped = [1, 2, 3].map(               \n\
        function (e) { return e * 2; }      \n\
      ).map(                                \n\
        function (e) { return -e; }         \n\
      ).map(                                \n\
        function (e, i) { return e + i; }   \n\
      );                                    \n\
                                            \n\
      expose mapped;                        \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ mapped: [-2, -3, -4] }]);
  });
});
