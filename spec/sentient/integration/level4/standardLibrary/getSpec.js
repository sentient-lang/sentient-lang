"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: get", function () {
  it("gets the element at index and a bounds-check boolean", function () {
    var program = Sentient.compile("\n\
      x = 1;                        \n\
      a, aPresent = [1, 2].get(x);  \n\
      expose a, aPresent;           \n\
    ");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 2, aPresent: true }]);

    program = Sentient.compile("\n\
      x = 2;                    \n\
      a, aP = [1, 2].get(x);    \n\
      expose a, aP;             \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: -1, aP: false }]);

    program = Sentient.compile("\n\
      x = 0;                    \n\
      a, aP = [true].get(x);    \n\
      expose a, aP;             \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: true, aP: true }]);

    program = Sentient.compile("\n\
      x = -1;                   \n\
      a, aP = [true].get(x);    \n\
      expose a, aP;             \n\
    ");
    result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: false, aP: false }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a, aP = get([1], 0); expose a, aP;");
    var result = Sentient.run({ program: program });
    expect(result).toEqual([{ a: 1, aP: true }]);
  });
});
