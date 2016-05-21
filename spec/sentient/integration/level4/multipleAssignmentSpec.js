"use strict";

var Sentient = require("../../../../lib/sentient");

describe("multiple assignment", function () {
  it("allows one-one assignment", function () {
    var program = Sentient.compile("a = 1; expose a;");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1 }]);
  });

  it("allows many-many assignment", function () {
    var program = Sentient.compile("a, b, c = 1, 2, 3; expose a, b, c;");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: 2, c: 3 }]);
  });

  it("works for functions that return multiple values", function () {
    var program = Sentient.compile("\n\
      function foo () {             \n\
        return 1, 2, 3;             \n\
      };                            \n\
                                    \n\
      a, b, c = foo();              \n\
      expose a, b, c;               \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: 2, c: 3 }]);
  });

  it("allows assignment of mixed types", function () {
    var program = Sentient.compile("a, b = 1, true; expose a, b;");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: true }]);
  });

  it("works for functions that return mixed types", function () {
    var program = Sentient.compile("\n\
      function foo () {             \n\
        return 1, true;             \n\
      };                            \n\
                                    \n\
      a, b = foo();                 \n\
      expose a, b;                  \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: true }]);
  });

  it("assigns from left-right with fewer variables than expr's", function () {
    var program = Sentient.compile("a, b = 1, 2, 3, 4; expose a, b;");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 1, b: 2 }]);
  });

  it("throws an error when there are fewer expr's than variables", function () {
    expect(function () {
      Sentient.compile("a, b = 1;");
    }).toThrow();
  });

  it("throws an error if a variable is used before declared", function () {
    expect(function () {
      Sentient.compile("a, b = 1, 2 * a;");
    }).toThrow();
  });

  it("allows variables to be swapped", function () {
    var program = Sentient.compile("\n\
      a, b = 1, 2;                  \n\
      b, a = a, b;                  \n\
                                    \n\
      expose a, b;                  \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ a: 2, b: 1 }]);
  });

  it("allows variables to be rotated", function () {
    var program = Sentient.compile("\n\
      a, b, c = 1, 2, 3;            \n\
      b, c, a = a, b, c;            \n\
                                    \n\
      expose a, b, c;               \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ b: 1, c: 2, a: 3 }]);
  });

  it("works for a complicated example", function () {
    var program = Sentient.compile("                  \n\
      function foo () { return 1, true; };            \n\
      function bar () { return false, 2; };           \n\
                                                      \n\
      a, b, c, d, e, f = 123, foo(), bar(), 456;      \n\
      e, f, d, c = a, b, c, d, e, f;                  \n\
                                                      \n\
      expose a, b, c, d, e, f;                        \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ e: 123, f: 1, d: true, c: false, b: 1, a: 123 }]);
  });
});
