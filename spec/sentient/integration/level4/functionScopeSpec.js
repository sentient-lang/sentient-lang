"use strict";

var Sentient = require("../../../../lib/sentient");

describe("function definitions", function () {
  it("supports functions with local scope", function () {
    var program = Sentient.compile("\n\
      function foo (a) {            \n\
        b = 789;                    \n\
        return a;                   \n\
      };                            \n\
                                    \n\
      a = 123;                      \n\
      b = 456;                      \n\
      c = foo(b);                   \n\
                                    \n\
      vary a, b, c;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123, b: 456, c: 456 });
  });

  it("supports functions with dynamic scope", function () {
    var program = Sentient.compile("\n\
      function^ foo () {             \n\
        return a;                   \n\
      };                            \n\
                                    \n\
      a = 123;                      \n\
      b = foo();                    \n\
      a = 456;                      \n\
      c = foo();                    \n\
                                    \n\
      vary a, b, c;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 456, b: 123, c: 456 });
  });

  it("allows variables from the context to be reassigned", function () {
    var program = Sentient.compile("\n\
      function^ double_x () {       \n\
        x *= 2;                     \n\
      };                            \n\
                                    \n\
      x = 111;                      \n\
      double_x();                   \n\
      double_x();                   \n\
                                    \n\
      vary x;                       \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ x: 444 });
  });

  it("allows functions to be shadowed", function () {
    var program = Sentient.compile("\n\
      function foo () {             \n\
        return 10;                  \n\
      };                            \n\
                                    \n\
      function bar () {             \n\
        function foo () {           \n\
          return 20;                \n\
        };                          \n\
        return foo();               \n\
      };                            \n\
                                    \n\
      a = foo();                    \n\
      b = bar();                    \n\
      c = foo();                    \n\
                                    \n\
      vary a, b, c;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 10, b: 20, c: 10 });
  });
});
