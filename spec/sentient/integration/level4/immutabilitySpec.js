"use strict";

var Sentient = require("../../../../lib/sentient");

describe("immutability", function () {
  it("allows user-defined functions to be redefined", function () {
    var program = Sentient.compile(" \n\
      function foo () { return 1; }; \n\
      function foo () { return 2; }; \n\
                                     \n\
      a = foo();                     \n\
      expose a;                      \n\
    ");
    var result = Sentient.run({ program: program });

    expect(result).toEqual([{ a: 2 }]);
  });

  it("does not allow standard library functions to be redefined", function () {
    spyOn(console, "error");

    expect(function () {
      Sentient.compile("function && () { return 1; };");
    }).toThrow();

    expect(function () {
      Sentient.compile("function if () { return 1; };");
    }).toThrow();

    expect(function () {
      Sentient.compile("function abs () { return 1; };");
    }).toThrow();
  });
});
