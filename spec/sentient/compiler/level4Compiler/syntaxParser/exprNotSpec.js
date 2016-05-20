"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprNot");

describe("exprNot", function () {
  it("accepts valid", function () {
    expect(subject.parse("!true")).toEqual(["!@", true]);
    expect(subject.parse("!false")).toEqual(["!@", false]);
    expect(subject.parse("!a")).toEqual(["!@", "a"]);
    expect(subject.parse("!foo")).toEqual(["!@", "foo"]);

    expect(subject.parse("-50")).toEqual(["-@", 50]);
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("! a"); }).toThrow();
    expect(function () { subject.parse("true a"); }).toThrow();
  });
});
