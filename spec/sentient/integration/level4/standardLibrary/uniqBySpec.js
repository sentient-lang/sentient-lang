"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: uniqBy?", function () {
  it("returns true if the array contains unique elements", function () {
    var program = Sentient.compile("       \n\
      a = [1, 2, 3].uniqBy?(function (x) { \n\
        return x;                          \n\
      });                                  \n\
      expose a;                            \n\
    ");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("            \n\
      a = [1, 2, -1].uniqBy?(function (x) { \n\
        return x.abs;                       \n\
      });                                   \n\
      expose a;                             \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("               \n\
      a = [[1], [2, 3]].uniqBy?(function (x) { \n\
        return x.length;                       \n\
      });                                      \n\
      expose a;                                \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);
  });
});
