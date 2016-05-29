"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: transpose", function () {
  it("transposes a nested array", function () {
    var program = Sentient.compile("\n\
      x = [[1, 2], [3, 4], [5, 6]]; \n\
      y = x.transpose;              \n\
      expose y;                     \n\
    ");
    var result = Sentient.run(program);
    expect(result).toEqual([{ y: [[1, 3, 5], [2, 4, 6]] }]);

    program = Sentient.compile("    \n\
      x = [[1, 2, 3], [4, 5, 6]];   \n\
      y = x.transpose;              \n\
      expose y;                     \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ y: [[1, 4], [2, 5], [3, 6]] }]);

    program = Sentient.compile("    \n\
      x = [[1], [2, 3]];            \n\
      y = x.transpose;              \n\
      expose y;                     \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ y: [[1, 2], [3]] }]);

    program = Sentient.compile("    \n\
      x = [[1], [2, 3]];            \n\
      y = x.transpose;              \n\
      z = y.transpose;              \n\
      expose z;                     \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ z: [[1], [2, 3]] }]);

    program = Sentient.compile("    \n\
      x = [[10], [20, 30]][0];      \n\
      y = [x, [40, 50], x];         \n\
      z = y.transpose;              \n\
      expose z;                     \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ z: [[10, 40, 10], [50]] }]);

    program = Sentient.compile("    \n\
      x = [[10], [20, 30]][0];      \n\
      y = [x, [40, 50], x];         \n\
      z = y.transpose;              \n\
      w = z.transpose;              \n\
      expose w;                     \n\
    ");
    result = Sentient.run(program);
    expect(result).toEqual([{ w: [[10], [40, 50], [10]] }]);
  });

  it("throws if not an array", function () {
    expect(function () {
      Sentient.compile("123.transpose;");
    }).toThrow();
  });

  it("throws if not a nested array", function () {
    expect(function () {
      Sentient.compile("[1, 2, 3].transpose;");
    }).toThrow();
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = [[1], [2, 3]].transpose; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: [[1, 2], [3]] }]);
  });
});
