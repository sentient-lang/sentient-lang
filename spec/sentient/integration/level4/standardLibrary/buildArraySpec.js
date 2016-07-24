"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: buildArray", function () {
  it("allows arrays of integers", function () {
    var program = Sentient.compile("a = [1, 2, 3]; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [1, 2, 3] }]);
  });

  it("allows arrays of booleans", function () {
    var program = Sentient.compile("a = [true, false]; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [true, false] }]);
  });

  it("allows arrays of arrays", function () {
    var program = Sentient.compile("a = [[1], [2]]; expose a;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [[1], [2]] }]);
  });

  it("allows empty arrays", function () {
    var program = Sentient.compile("a, b = [], 1; expose a, b;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [], b: 1 }]);
  });

  it("allows nested empty arrays", function () {
    var program = Sentient.compile("a, b = [[]], 1; expose a, b;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [[]], b: 1 }]);

    program = Sentient.compile("a, b = [[1], []], 1; expose a, b;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [[1], []], b: 1 }]);

    program = Sentient.compile("a, b = [[[]], []], 1; expose a, b;");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: [[[]], []], b: 1 }]);
  });

  it("does not allow mixed type arrays", function () {
    expect(function () {
      Sentient.compile("a = [1, true]; expose a;");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [1, [2]]; expose a;");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [true, []]; expose a;");
    }).toThrow();

    expect(function () {
      Sentient.compile("a = [[1], [[]]]; expose a;");
    }).toThrow();
  });
});
