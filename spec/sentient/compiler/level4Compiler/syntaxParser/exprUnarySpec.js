"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprUnary");

describe("exprUnary", function () {
  it("accepts valid", function () {
    expect(subject.parse("-0")).toEqual(["-@", 0]);
    expect(subject.parse("-1")).toEqual(["-@", 1]);
    expect(subject.parse("-123")).toEqual(["-@", 123]);
    expect(subject.parse("-a")).toEqual(["-@", "a"]);
    expect(subject.parse("-foo")).toEqual(["-@", "foo"]);
    expect(subject.parse("!true")).toEqual(["!@", true]);
    expect(subject.parse("!false")).toEqual(["!@", false]);
    expect(subject.parse("!a")).toEqual(["!@", "a"]);
    expect(subject.parse("!foo")).toEqual(["!@", "foo"]);

    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("- 3"); }).toThrow();
    expect(function () { subject.parse("! a"); }).toThrow();
    expect(function () { subject.parse("true a"); }).toThrow();
  });
});
