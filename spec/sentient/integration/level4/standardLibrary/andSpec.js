"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: &&", function () {
  it("returns a && b", function () {
    var program = Sentient.compile("a = true && true; expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: true }]);

    program = Sentient.compile("a = true && false; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = true && false; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);

    program = Sentient.compile("a = false && false; expose a;");
    result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = &&(true, false); expose a;");
    var result = Sentient.run(program);
    expect(result).toEqual([{ a: false }]);
  });
});
