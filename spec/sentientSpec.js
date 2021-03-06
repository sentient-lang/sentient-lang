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

    var result = Sentient.run({
      program: program,
      assignments: { target: 21 }
    });
    expect(result).toEqual([{ p1: 7, p2: 3, target: 21 }]);

    result = Sentient.run({
      program: program,
      assignments: { target: 65 }
    });
    expect(result).toEqual([{ p1: 5, p2: 13, target: 65 }]);

    result = Sentient.run({
      program: program,
      assignments: { target: 221 }
    });
    expect(result).toEqual([{ p1: 17, p2: 13, target: 221 }]);

    result = Sentient.run({
      program: program,
      assignments: { p1: 19 }
    });
    expect(result).toEqual([{ p1: 19, p2: 7, target: 133 }]);
  });

  it("can run against different SAT solvers", function () {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      expose a, b, total;                          \n\
    ");

    var result = Sentient.run({
      program: program,
      assignments: { total: 100 },
      number: 1,
      machine: MinisatAdapter
    });
    expect(result).toEqual([{ a: 38, b: 62, total: 100 }]);

    result = Sentient.run({
      program: program,
      assignments: { total: 100 },
      number: 1,
      machine: LingelingAdapter
    });
    expect(result).toEqual([{ a: 39, b: 61, total: 100 }]);
  });

  it("can find multiple solutions", function () {
    var program = Sentient.compile("               \n\
      int a, b;                                    \n\
      invariant a > 0, b > 0;                      \n\
      total = a + b;                               \n\
      expose a, b, total;                          \n\
    ");

    var result = Sentient.run({
      program: program,
      assignments: { total: 100 },
      number: 5,
      machine: MinisatAdapter
    });

    expect(result).toEqual([
      { a: 38, b: 62, total: 100 },
      { a: 32, b: 68, total: 100 },
      { a: 36, b: 64, total: 100 },
      { a: 68, b: 32, total: 100 },
      { a: 4, b: 96, total: 100 }
    ]);

    result = Sentient.run({
      program: program,
      assignments: { total: 100 },
      number: 5,
      machine: LingelingAdapter
    });

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

    var callback = function (result) {
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
    };

    Sentient.run({
      program: program,
      assignments: { total: 100 },
      number: 5,
      callback: callback
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
      Sentient.run({
        program: machineCode,
        assignments: { a: 123 },
        number: 0,
        callback: function () {}
      });
    });

    setInterval(function () {
      if (messages.length === 31) {
        expect(messages[0]).toEqual("Compiling program...");

        Sentient.logger.reset();
        done();
      }
    }, 10);
  });

  it("logs info output", function () {
    Sentient.logger.level = "info";

    var messages = [];

    Sentient.logger.log = function (message) {
      messages.push(message);
    };

    var program = Sentient.compile("a = 123; expose a;");

    Sentient.run({
      program: program,
      number: 0,
      callback: function () {}
    });

    Sentient.logger.reset();

    expect(messages.length).toEqual(4);
    expect(messages[0]).toEqual("Compiling program...");
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
    expect(error.toString().substring(0, 33)).toEqual(
      "Error: sentient:1:8: syntax error"
    );
  });

  it("can retrieve the source code of a program", function () {
    var program = Sentient.compile("int a; expose a;");
    var source = Sentient.source(program);

    expect(source).toEqual("int a; expose a;");
  });

  it("can retrieve information about exposed variables", function () {
    var program = Sentient.compile("int a; expose a;");
    var exposed = Sentient.exposed(program);

    expect(exposed).toEqual({
      a: {
        type: "integer",
        minimum: -128,
        maximum: 127
      }
    });
  });
});
