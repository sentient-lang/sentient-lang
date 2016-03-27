"use strict";

var Sentient = require("../lib/sentient");

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
      vary p1, p2, target;                         \n\
    ");

    var result = Sentient.run(program, { target: 21 });
    expect(result).toEqual({ p1: 7, p2: 3, target: 21 });

    result = Sentient.run(program, { target: 65 });
    expect(result).toEqual({ p1: 5, p2: 13, target: 65 });

    result = Sentient.run(program, { target: 221 });
    expect(result).toEqual({ p1: 13, p2: 17, target: 221 });

    result = Sentient.run(program, { p1: 19 });
    expect(result).toEqual({ p1: 19, p2: 2, target: 38 });
  });

  it("can run against different SAT solvers", function () {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      vary a, b, total;                            \n\
    ");

    var MinisatAdapter = require("../lib/sentient/machine/minisatAdapter");
    var LingelingAdapter = require("../lib/sentient/machine/lingelingAdapter");

    var result = Sentient.run(program, { total: 100 }, MinisatAdapter);
    expect(result).toEqual({ a: 38, b: 62, total: 100 });

    result = Sentient.run(program, { total: 100 }, LingelingAdapter);
    expect(result).toEqual({ a: 39, b: 61, total: 100 });
  });
});
