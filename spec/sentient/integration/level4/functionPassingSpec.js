"use strict";

var Sentient = require("../../../../lib/sentient");

describe("function passing", function () {
  it("supports passing functions to other functions", function () {
    var program = Sentient.compile("     \n\
      function foo (*func) {             \n\
        return func();                   \n\
      };                                 \n\
                                         \n\
      function bar () {                  \n\
        return 123;                      \n\
      };                                 \n\
                                         \n\
      a = foo(*bar);                     \n\
      expose a;                          \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123 });
  });

  it("can detect recursive function calls", function () {
    expect(function () {
      Sentient.compile("function foo (*f) { f(*f); }; foo(*foo);");
    }).toThrow();

    expect(function () {
      Sentient.compile("                \n\
        function foo (*x) { x(*bar); }; \n\
        function bar (*y) { y(*foo); }; \n\
        foo(*bar);                      \n\
      ");
    }).toThrow();
  });

  it("does not mistakenly detect recursive calls", function () {
    expect(function () {
      Sentient.compile("      \n\
        function foo (*foo) { \n\
          foo();              \n\
        };                    \n\
                              \n\
        function bar () {     \n\
          function bar () {}; \n\
          foo(*bar);          \n\
        };                    \n\
                              \n\
        bar();                \n\
      ");
    }).not.toThrow();
  });

  it("allows passed functions to be called as methods", function () {
    var program = Sentient.compile("  \n\
      function double (x) {           \n\
        return x * 2;                 \n\
      };                              \n\
                                      \n\
      function foo (x, *f, *g) {      \n\
        return x.f.g;                 \n\
      };                              \n\
                                      \n\
      a = foo(111, *double, *double); \n\
      expose a;                       \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 444 });
  });

  it("allows function calls that use different contexts", function () {
    var program = Sentient.compile("          \n\
      function setContext(*context, *func) {  \n\
        return func();                        \n\
      };                                      \n\
                                              \n\
      function context1 () { return 123; };   \n\
      function context2 () { return 456; };   \n\
      function foo () { return context(); };  \n\
                                              \n\
      a = setContext(*context1, *foo);        \n\
      b = setContext(*context2, *foo);        \n\
                                              \n\
      expose a, b;                            \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123, b: 456 });
  });

  it("allows for unusual, expressive ways to write programs", function () {
    var program = Sentient.compile("    \n\
      function fixedPoint(x, *f) {      \n\
        invariant x == f(x);            \n\
      };                                \n\
                                        \n\
      function cube (x) {               \n\
        return x * x * x;               \n\
      };                                \n\
                                        \n\
      int3 x, y, z;                     \n\
                                        \n\
      x.fixedPoint(*cube);              \n\
      y.fixedPoint(*cube);              \n\
      z.fixedPoint(*cube);              \n\
                                        \n\
      invariant x != y, x != z, y != z; \n\
      expose x, y, z;                   \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ x: 0, y: 1, z: -1 });
  });

  it("allows passed functions to be privately redefined", function () {
    var program = Sentient.compile("   \n\
      function f () { return 123; };   \n\
                                       \n\
      function foo (*f) {              \n\
        x = f();                       \n\
        function f () { return 456; }; \n\
        y = f();                       \n\
        return x, y;                   \n\
      };                               \n\
                                       \n\
      a, b, c = foo(*f), f();          \n\
      expose a, b, c;                  \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 123, b: 456, c: 123 });
  });
});
