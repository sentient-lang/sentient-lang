/* jshint evil:true */

"use strict";

var SpecHelper = require("../specHelper");
var describedClass = require("../../lib/sentient/cli");
var Sentient = require("../../lib/main");
var Readable = require("stream").Readable;
var fs = require("fs");

var MinisatAdapter = require("../../lib/sentient/machine/minisatAdapter");
var LingelingAdapter = require("../../lib/sentient/machine/lingelingAdapter");
var RissAdapter = require("../../lib/sentient/machine/rissAdapter");

describe("CLI", function () {
  var subject;

  beforeEach(function () {
    spyOn(console, "log");

    spyOn(MinisatAdapter, "solve").and.callThrough();
    spyOn(LingelingAdapter, "solve").and.callThrough();
    spyOn(RissAdapter, "solve").and.callThrough();
  });

  afterEach(function () {
    Sentient.logger.reset();
  });

  var run = function (input, args) {
    var mockStdin = new Readable();

    mockStdin._read = function () {};
    mockStdin.push(input);
    mockStdin.push(null);

    var mockProcess = {
      stdin: mockStdin,
      argv: ["node", "sentient"].concat(args),
      exit: function () {}
    };

    subject = new describedClass(mockProcess);
    subject.run();
  };

  it("can compile and run a program", function (done) {
    run("a = 111 + 222; expose a;", []);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 333 });
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can read its input from a file", function (done) {
    fs.writeFileSync("/tmp/cliSpec.tmp", "a = 123; expose a;");

    run("", ["/tmp/cliSpec.tmp"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });
        try { fs.unlinkSync("/tmp/cliSpec.tmp"); } catch (error) { }
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can compile a program without optimising/running it", function (done) {
    run("a = 111 + 222; expose a;", ["--compile"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0]).dimacs.length).toBeGreaterThan(2000);
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can run a program without compiling/optimising it", function (done) {
    var precompiled = Sentient.compile("a = 111 + 222; expose a;");

    run(JSON.stringify(precompiled), ["--run"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 333 });
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can optimise a program without compiling/running it", function (done) {
    var precompiled = Sentient.compile("a = 111 + 222; expose a;");

    run(JSON.stringify(precompiled), ["--optimise"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0]).dimacs.length).toBeLessThan(100);
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("does not optimise programs by default", function (done) {
    spyOn(Sentient, "optimise");
    run("a = 111 + 222; expose a;", []);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 333 });
        expect(Sentient.optimise).not.toHaveBeenCalled();
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can assign values to exposed variables", function (done) {
    run("int a; expose a;", ["--assign", "{ a: 23 }"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 23 });
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can assign values from a file", function (done) {
    fs.writeFileSync("/tmp/cliSpec.tmp", "{ a: 23 }");

    run("int a; expose a;", ["--assign-file", "/tmp/cliSpec.tmp"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 23 });
        try { fs.unlinkSync("/tmp/cliSpec.tmp"); } catch (error) { }
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can specify the number of solutions", function (done) {
    run("int a; expose a;", ["--number", "3"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 3) {
        expect(JSON.parse(calls[0])).toEqual({ a: 0 });
        expect(JSON.parse(calls[1])).toEqual({ a: -128 });
        expect(JSON.parse(calls[2])).toEqual({ a: 64 });

        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can be set to run until solutions are exhausted", function (done) {
    run("int a; expose a; invariant a > 1, a < 5;", ["--number", "0"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 4) {
        expect(JSON.parse(calls[0])).toEqual({ a: 4 });
        expect(JSON.parse(calls[1])).toEqual({ a: 3 });
        expect(JSON.parse(calls[2])).toEqual({ a: 2 });
        expect(JSON.parse(calls[3])).toEqual({});

        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can specify that minisat should do the solving", function (done) {
    run("a = 123; expose a;", ["--machine", "minisat"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });

        expect(MinisatAdapter.solve).toHaveBeenCalled();
        expect(LingelingAdapter.solve).not.toHaveBeenCalled();
        expect(RissAdapter.solve).not.toHaveBeenCalled();

        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can specify that lingeling should do the solving", function (done) {
    run("a = 123; expose a;", ["--machine", "lingeling"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });

        expect(MinisatAdapter.solve).not.toHaveBeenCalled();
        expect(LingelingAdapter.solve).toHaveBeenCalled();
        expect(RissAdapter.solve).not.toHaveBeenCalled();

        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can specify that riss should do the solving", function (done) {
    run("a = 123; expose a;", ["--machine", "riss"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });

        expect(MinisatAdapter.solve).not.toHaveBeenCalled();
        expect(LingelingAdapter.solve).not.toHaveBeenCalled();
        expect(RissAdapter.solve).toHaveBeenCalled();

        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("defaults to the 'error' log level", function (done) {
    spyOn(console, "warn");
    run("a = 123; expose a;", []);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });
        expect(SpecHelper.calls(console.warn).length).toEqual(0);
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can set the log level to info", function (done) {
    spyOn(console, "warn");
    run("a = 123; expose a;", ["--info"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });
        expect(SpecHelper.calls(console.warn).length).toBeGreaterThan(0);
        expect(SpecHelper.calls(console.warn).length).toBeLessThan(10);
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can set the log level to debug", function (done) {
    spyOn(console, "warn");
    spyOn(console, "debug");

    run("a = 123; expose a;", ["--debug"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({ a: 123 });
        expect(SpecHelper.calls(console.warn).length).toBeGreaterThan(0);
        expect(SpecHelper.calls(console.debug).length).toBeGreaterThan(0);
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can print the source code of a compiled program", function (done) {
    var precompiled = Sentient.compile("a = 111 + 222; expose a;");

    run(JSON.stringify(precompiled), ["--source"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(calls[0]).toEqual("a = 111 + 222; expose a;");
        clearInterval(interval);
        done();
      }
    }, 10);
  });

  it("can print the exposed variables of a compiled program", function (done) {
    var precompiled = Sentient.compile("a = 111 + 222; expose a;");

    run(JSON.stringify(precompiled), ["--exposed"]);

    var interval = setInterval(function () {
      var calls = SpecHelper.calls(console.log);

      if (calls.length === 1) {
        expect(JSON.parse(calls[0])).toEqual({
          a: {
            type: "integer",
            minimum: -512,
            maximum: 511
          }
        });
        clearInterval(interval);
        done();
      }
    }, 10);
  });
});
