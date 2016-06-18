"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level1Compiler/codeWriter");

describe("CodeWriter", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("writes the simplest program", function () {
    var code = subject.write();

    expect(code).toEqual({
      level1Variables: {},
      dimacs: "p cnf 0 0\n"
    });
  });

  it("can set the metadata", function () {
    subject.metadata({ foo: "bar", baz: 123 });
    var code = subject.write();

    expect(code).toEqual({
      foo: "bar",
      baz: 123,
      level1Variables: {},
      dimacs: "p cnf 0 0\n"
    });
  });

  it("can set the variables", function () {
    subject.variable("foo", 1);
    subject.variable("bar", 2);
    var code = subject.write();

    expect(code).toEqual({
      level1Variables: {
        foo: 1,
        bar: 2
      },
      dimacs: "p cnf 0 0\n"
    });
  });

  it("can set the variables and the metadata together", function () {
    subject.variable("foo", 1);
    subject.metadata({ foo: "bar", baz: 123 });
    subject.variable("bar", 2);
    var code = subject.write();

    expect(code).toEqual({
      foo: "bar",
      baz: 123,
      level1Variables: {
        foo: 1,
        bar: 2
      },
      dimacs: "p cnf 0 0\n"
    });
  });

  it("can set the clauses", function () {
    subject.clause(-1, -2, 3);
    subject.clause(1, -3);
    subject.clause(2, -3);
    subject.clause(3);
    var code = subject.write();

    expect(code).toEqual({
      level1Variables: {},
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 4                         \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
        3 0                               \n\
      ")
    });
  });

  it("behaves as expected for a complicated example", function() {
    subject.variable("a", 1);

    subject.clause(1, -1);
    subject.clause(2, -2);
    subject.clause(-1, -2, 3);
    subject.clause(1, -3);
    subject.clause(2, -3);
    subject.clause(3);

    subject.variable("b", 2);

    subject.metadata({
      title: "Example program",
      author: "Chris Patuzzo",
      date: "2015-11-24"
    });

    subject.variable("out", 3);

    var code = subject.write();

    expect(code).toEqual({
      title: "Example program",
      author: "Chris Patuzzo",
      date: "2015-11-24",
      level1Variables: {
        a: 1,
        b: 2,
        out: 3
      },
      dimacs: SpecHelper.stripWhitespace("\n\
        p cnf 3 6                         \n\
        1 -1 0                            \n\
        2 -2 0                            \n\
        -1 -2 3 0                         \n\
        1 -3 0                            \n\
        2 -3 0                            \n\
        3 0                               \n\
      ")
    });
  });
});
