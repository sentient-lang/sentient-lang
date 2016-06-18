"use strict";

var Sentient = require("../../../../lib/sentient");

describe("function return", function () {
  it("supports functions that return nothing", function () {
    var program = Sentient.compile("     \n\
      function^ double_x () { x *= 2; }; \n\
      x = 123;                           \n\
      double_x();                        \n\
      expose x;                          \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ x: 246 }]);
  });

  it("supports functions that return multiple values", function () {
    var program = Sentient.compile("       \n\
      function foo () { return 1, true; }; \n\
      a, b = foo();                        \n\
      expose a, b;                         \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: true }]);
  });

  it("supports explicitly setting the return width", function () {
    var program = Sentient.compile("       \n\
      function foo () { return 1, true; }; \n\
      function bar () { return2 foo(); };  \n\
      a, b = bar();                        \n\
      expose a, b;                         \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: true }]);
  });

  it("throws an error if the return width is too small", function () {
    spyOn(console, "error");

    expect(function () {
      Sentient.compile("function foo () { return1 1, true; };");
    }).toThrow();
  });

  it("throws an error at call time if return width is too large", function () {
    spyOn(console, "error");

    expect(function () {
      Sentient.compile("function foo () { return3 1, true; };");
    }).not.toThrow();

    expect(function () {
      Sentient.compile("function foo () { return3 1, true; }; foo();");
    }).toThrow();
  });
});
