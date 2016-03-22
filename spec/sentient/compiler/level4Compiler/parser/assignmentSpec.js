"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("assignment", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
      allowedStartRules: ["assignment"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a = b")).toEqual(["a", "b"]);
    expect(subject.parse("a = true")).toEqual(["a", true]);
    expect(subject.parse("a = b && c")).toEqual(["a", ["b", "c", "&&"]]);
    expect(subject.parse("foo_1 = -5")).toEqual(["foo_1", [5, "-"]]);
    expect(subject.parse("a = b == c")).toEqual(["a", ["b", "c", "=="]]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a"); }).toThrow();
    expect(function () { subject.parse("a=b"); }).toThrow();
    expect(function () { subject.parse("a= b"); }).toThrow();
    expect(function () { subject.parse("a =b"); }).toThrow();
    expect(function () { subject.parse("a = b = c"); }).toThrow();
    expect(function () { subject.parse("a == b"); }).toThrow();
    expect(function () { subject.parse("a = 1, 2"); }).toThrow();
  });
});
