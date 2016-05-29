"use strict";

var Sentient = require("../lib/sentient");
var MinisatAdapter = require("../lib/sentient/machine/minisatAdapter");
var LingelingAdapter = require("../lib/sentient/machine/lingelingAdapter");

describe("Sentient", function () {
  it("can compile and run programs", function () {
    var program = Sentient.compile("               \n\
      primes = [2, 3, 5, 7, 11, 13, 17, 19];       \n\
                                                   \n\
      int10 i, j;                                  \n\
      p1 = primes[i];                              \n\
      p2 = primes[j];                              \n\
                                                   \n\
      int10 target;                                \n\
      invariant p1 * p2 == target;                 \n\
                                                   \n\
      expose p1, p2, target;                       \n\
    ");

    var result = Sentient.run(program, { target: 21 });
    expect(result).toEqual([{ p1: 7, p2: 3, target: 21 }]);

    result = Sentient.run(program, { target: 65 });
    expect(result).toEqual([{ p1: 5, p2: 13, target: 65 }]);

    result = Sentient.run(program, { target: 221 });
    expect(result).toEqual([{ p1: 13, p2: 17, target: 221 }]);

    result = Sentient.run(program, { p1: 19 });
    expect(result).toEqual([{ p1: 19, p2: 2, target: 38 }]);
  });

  it("can run against different SAT solvers", function () {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      expose a, b, total;                          \n\
    ");

    var result = Sentient.run(
      program, { total: 100 }, 1, undefined, MinisatAdapter
    );
    expect(result).toEqual([{ a: 38, b: 62, total: 100 }]);

    result = Sentient.run(
      program, { total: 100 }, 1, undefined, LingelingAdapter
    );
    expect(result).toEqual([{ a: 39, b: 61, total: 100 }]);
  });

  it("can find multiple solutions", function () {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      expose a, b, total;                          \n\
    ");

    var result = Sentient.run(
      program, { total: 100 }, 5, undefined, MinisatAdapter
    );

    expect(result).toEqual([
      { a: 38, b: 62, total: 100 },
      { a: 80, b: 20, total: 100 },
      { a: 41, b: 59, total: 100 },
      { a: 37, b: 63, total: 100 },
      { a: 45, b: 55, total: 100 }
    ]);

    result = Sentient.run(
      program, { total: 100 }, 5, undefined, LingelingAdapter
    );

    expect(result).toEqual([
      { a: 39, b: 61, total: 100 },
      { a: 52, b: 48, total: 100 },
      { a: 32, b: 68, total: 100 },
      { a: 96, b: 4,  total: 100 },
      { a: 51, b: 49, total: 100 }
    ]);
  });

  it("can find solutions asynchronously", function (done) {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      expose a, b, total;                          \n\
    ");

    var results = [];

    Sentient.run(program, { total: 100 }, 5, function (result) {
      results.push(result);

      if (results.length === 5) {
        expect(results).toEqual([
          { a: 38, b: 62, total: 100 },
          { a: 80, b: 20, total: 100 },
          { a: 41, b: 59, total: 100 },
          { a: 37, b: 63, total: 100 },
          { a: 45, b: 55, total: 100 }
        ]);

        done();
      }
    });
  });

  it("can compile programs asynchronously", function (done) {
    Sentient.compile("a = 123;", function (machineCode) {
      expect(machineCode.substring(0, 10)).toEqual("c Sentient");
      done();
    });
  });

  it("holds information from the package", function () {
    expect(Sentient.info.name).toEqual("sentient-lang");
    expect(Sentient.info.license).toEqual("MIT");
  });
});
