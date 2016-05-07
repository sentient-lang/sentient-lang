"use strict";

var Sentient = require("../../../../lib/sentient");

describe("inline function definitions", function () {
  it("supports passing inline functions to functions", function () {
    var program = Sentient.compile("     \n\
      function foo (*func) {             \n\
        return func();                   \n\
      };                                 \n\
                                         \n\
      a = foo(function () {              \n\
        return 123;                      \n\
      });                                \n\
                                         \n\
      vary a;                            \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123 });
  });

  it("supports passing multiple inline functions", function () {
    var program = Sentient.compile(" \n\
      function foo (*f, *g, *h) {    \n\
        return f(), g(), h();        \n\
      };                             \n\
                                     \n\
      a, b, c = foo(                 \n\
        function () { return 123; }, \n\
        function () { return 456; }, \n\
        function () { return 789; }  \n\
      );                             \n\
                                     \n\
      vary a, b, c;                  \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123, b: 456, c: 789 });
  });

  it("registers the function if a name is provided", function () {
    var program = Sentient.compile(" \n\
      function foo (*f) {            \n\
        return f();                  \n\
      };                             \n\
                                     \n\
      a = foo(function x () {        \n\
        return 123;                  \n\
      });                            \n\
                                     \n\
      b = x();                       \n\
                                     \n\
      vary a, b;                     \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123, b: 123 });
  });

  it("allows inline function definitions for method calls", function () {
    var program = Sentient.compile("     \n\
      function callTwice (target, *f) {  \n\
        return f(f(target));             \n\
      };                                 \n\
                                         \n\
      a = 5.callTwice(function (x) {     \n\
        return x + 1;                    \n\
      });                                \n\
                                         \n\
      vary a;                            \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 7 });
  });

  it("allows dynamically scoped inline functions", function () {
    var program = Sentient.compile("     \n\
      function^ callTwice (target, *f) { \n\
        f(target);                       \n\
        f(target);                       \n\
      };                                 \n\
                                         \n\
      global = 123;                      \n\
                                         \n\
      10.callTwice(function^ (x) {       \n\
        global -= x;                     \n\
      });                                \n\
                                         \n\
      vary global;                       \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ global: 103 });
  });
});
