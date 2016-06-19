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
      { a: 32, b: 68, total: 100 },
      { a: 36, b: 64, total: 100 },
      { a: 68, b: 32, total: 100 },
      { a: 4, b: 96, total: 100 }
    ]);

    result = Sentient.run(
      program, { total: 100 }, 5, undefined, LingelingAdapter
    );

    expect(result).toEqual([
      { a: 39, b: 61, total: 100 },
      { a: 63, b: 37, total: 100 },
      { a: 31, b: 69, total: 100 },
      { a: 95, b: 5, total: 100 },
      { a: 47, b: 53, total: 100 }
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
          { a: 32, b: 68, total: 100 },
          { a: 36, b: 64, total: 100 },
          { a: 68, b: 32, total: 100 },
          { a: 4, b: 96, total: 100 }
        ]);

        done();
      }
    });
  });

  it("can compile programs asynchronously", function (done) {
    Sentient.compile("a = 123;", function (machineCode) {
      expect(machineCode.dimacs.length).toBeGreaterThan(10);
      done();
    });
  });

  it("logs debug output", function (done) {
    Sentient.logger.level = "debug";

    var messages = [];

    Sentient.logger.log = function (message) {
      messages.push(message);
    };

    Sentient.compile("int a; expose a;", function (machineCode) {
      Sentient.run(machineCode, { a: 123 }, 0, function () {});
    });

    setInterval(function () {
      if (messages.length === 31) {
        expect(messages[0]).toEqual("Compiling program...");

        Sentient.logger.reset();
        done();
      }
    }, 10);
  });

  it("logs info output", function (done) {
    Sentient.logger.level = "info";

    var messages = [];

    Sentient.logger.log = function (message) {
      messages.push(message);
    };

    Sentient.compile("a = 123; expose a;", function (machineCode) {
      Sentient.run(machineCode, {}, 0, function () {});
    });

    setInterval(function () {
      if (messages.length === 4) {
        expect(messages[0]).toEqual("Compiling program...");

        Sentient.logger.reset();
        done();
      }
    }, 10);
  });

  it("holds information from the package", function () {
    expect(Sentient.info.name).toEqual("sentient-lang");
    expect(Sentient.info.license).toEqual("MIT");
  });

  it("logs errors with Sentient.logger.error", function () {
    var messages = [];

    Sentient.logger.log = function (message, level) {
      messages.push([message, level]);
    };

    expect(function () {
      Sentient.compile("invalid");
    }).toThrow();

    expect(messages[0]).toEqual(["Compiling program...", "info"]);

    var error = messages[2];
    expect(error.toString().substring(0, 26)).toEqual(
      "sentient:1:8: syntax error"
    );
  });

  it("can retrieve the source code of a program", function () {
    var program = Sentient.compile("int a; expose a;");
    var source = Sentient.source(program);

    expect(source).toEqual("int a; expose a;");
  });
});
