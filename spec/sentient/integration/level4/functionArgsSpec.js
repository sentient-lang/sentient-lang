"use strict";

var Sentient = require("../../../../lib/sentient");

describe("function arguments", function () {
  it("supports functions with different argument lengths", function () {
    var program = Sentient.compile("             \n\
      function foo () { return 1; };             \n\
      function bar (a) { return 2; };            \n\
      function baz (a, b) { return 3; };         \n\
      a, b, c = foo(), bar(123), baz(456, 789);  \n\
      expose a, b, c;                            \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("passes self as the first argument if called as a method", function () {
    var program = Sentient.compile("\n\
      function eq (self, other) {   \n\
        return self == other;       \n\
      };                            \n\
                                    \n\
      a = 123.eq(123);              \n\
      b = 123.eq(456);              \n\
                                    \n\
      expose a, b;                  \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: true, b: false });
  });

  it("throws an error if calling with wrong number of arguments", function () {
    expect(function () {
      Sentient.compile("function foo () { return 1; }; a = foo(123);");
    });

    expect(function () {
      Sentient.compile("function foo (a) { return 1; }; a = foo(123, 456);");
    });
  });
});
