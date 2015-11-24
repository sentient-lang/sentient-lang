"use strict";

var SpecHelper = require("../specHelper");
var describedClass = require("../../lib/sentient/codeWriter");

describe("CodeWriter", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("writes the simplest program", function () {
    var code = subject.write();

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "variables": {}                            \n\
      c }                                            \n\
      p cnf 0 0                                      \n\
    '));
  });

  it("can set the metadata", function () {
    subject.metadata({ foo: "bar", baz: 123 });
    var code = subject.write();

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "foo": "bar",                              \n\
      c   "baz": 123,                                \n\
      c   "variables": {}                            \n\
      c }                                            \n\
      p cnf 0 0                                      \n\
    '));
  });

  it("can set the variables", function () {
    subject.variable("foo", 1);
    subject.variable("bar", 2);
    var code = subject.write();

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "variables": {                             \n\
      c     "foo": 1,                                \n\
      c     "bar": 2                                 \n\
      c   }                                          \n\
      c }                                            \n\
      p cnf 0 0                                      \n\
    '));
  });

  it("can set the variables and the metadata together", function () {
    subject.variable("foo", 1);
    subject.metadata({ foo: "bar", baz: 123 });
    subject.variable("bar", 2);
    var code = subject.write();

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "foo": "bar",                              \n\
      c   "baz": 123,                                \n\
      c   "variables": {                             \n\
      c     "foo": 1,                                \n\
      c     "bar": 2                                 \n\
      c   }                                          \n\
      c }                                            \n\
      p cnf 0 0                                      \n\
    '));
  });

  it("can set the clauses", function () {
    subject.clause(-1, -2, 3);
    subject.clause(1, -3);
    subject.clause(2, -3);
    subject.clause(3);
    var code = subject.write();

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "variables": {}                            \n\
      c }                                            \n\
      p cnf 3 4                                      \n\
      -1 -2 3                                        \n\
      1 -3                                           \n\
      2 -3                                           \n\
      3                                              \n\
    '));
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

    expect(code).toEqual(SpecHelper.stripWhitespace('\n\
      c Sentient Machine Code, Version 1.0           \n\
      c {                                            \n\
      c   "title": "Example program",                \n\
      c   "author": "Chris Patuzzo",                 \n\
      c   "date": "2015-11-24",                      \n\
      c   "variables": {                             \n\
      c     "a": 1,                                  \n\
      c     "b": 2,                                  \n\
      c     "out": 3                                 \n\
      c   }                                          \n\
      c }                                            \n\
      p cnf 3 6                                      \n\
      1 -1                                           \n\
      2 -2                                           \n\
      -1 -2 3                                        \n\
      1 -3                                           \n\
      2 -3                                           \n\
      3                                              \n\
    '));
  });
});
