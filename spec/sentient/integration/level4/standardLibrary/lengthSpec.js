"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: length", function () {
  it("returns the length of the array", function () {
    var program = Sentient.compile("a = [0, 0, 0].length; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: 3 }]);

    program = Sentient.compile("a = [0].length; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 1 }]);
  });

  it("returns the length of a nested array", function () {
    var program = Sentient.compile("a = [[10], [20, 30,40]].length; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: 2 }]);

    program = Sentient.compile("a = [[10], [20, 30, 40]][0].length; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 1 }]);

    program = Sentient.compile("a = [[10], [20, 30, 40]][1].length; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: 3 }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = length([1, 2]); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: 2 }]);
  });
});
