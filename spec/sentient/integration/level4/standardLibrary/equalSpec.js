"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: ==", function () {
  it("tests the equality of integers", function () {
    var program = Sentient.compile("a = 1 == 2; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 0 == -3; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = 2 == 2; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);
  });

  it("tests the equality of booleans", function () {
    var program = Sentient.compile("a = true == false; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = false == true; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = true == true; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = false == false; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = ==(true, false); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);
  });
});
