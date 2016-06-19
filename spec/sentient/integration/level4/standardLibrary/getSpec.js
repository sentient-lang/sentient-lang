"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: get", function () {
  it("gets the element at index and a bounds-check boolean", function () {
    var program = Sentient.compile("\n\
      x = 1;                        \n\
      a, aNil = [1, 2].get(x);      \n\
      expose a, aNil;               \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2, aNil: false }]);

    program = Sentient.compile("\n\
      x = 2;                        \n\
      a, aNil = [1, 2].get(x);      \n\
      expose a, aNil;               \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 0, aNil: true }]);

    program = Sentient.compile("\n\
      x = 0;                   \n\
      a, aNil = [true].get(x); \n\
      expose a, aNil;          \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true, aNil: false }]);

    program = Sentient.compile("\n\
      x = -1;                  \n\
      a, aNil = [true].get(x); \n\
      expose a, aNil;          \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false, aNil: true }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a, aNil = get([1], 0); expose a, aNil;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 1, aNil: false }]);
  });
});
