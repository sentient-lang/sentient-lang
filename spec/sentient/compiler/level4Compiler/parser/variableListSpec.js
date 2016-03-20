"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("variableList", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
      allowedStartRules: ["variableList"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a")).toEqual(["a"]);
    expect(subject.parse("a,b")).toEqual(["a", "b"]);
    expect(subject.parse("a, b")).toEqual(["a", "b"]);
    expect(subject.parse("a, b,c,   d")).toEqual(["a", "b", "c", "d"]);
    expect(subject.parse("a , b,c ,  d")).toEqual(["a", "b", "c", "d"]);
    expect(subject.parse("a_b_0, foo")).toEqual(["a_b_0", "foo"]);
    expect(subject.parse("a \n , \n b")).toEqual(["a", "b"]);
    expect(subject.parse("a # comment\n , \n b")).toEqual(["a", "b"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse(" a"); }).toThrow();
    expect(function () { subject.parse("a "); }).toThrow();
    expect(function () { subject.parse("a b"); }).toThrow();
    expect(function () { subject.parse("A"); }).toThrow();
    expect(function () { subject.parse("_, b"); }).toThrow();
    expect(function () { subject.parse("_, b c"); }).toThrow();
    expect(function () { subject.parse("a # comment , b"); }).toThrow();
  });
});
