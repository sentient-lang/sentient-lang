"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("positiveInteger");

describe("positiveInteger", function () {
  it("accepts valid", function () {
    expect(subject.parse("1")).toEqual(1);
    expect(subject.parse("2")).toEqual(2);
    expect(subject.parse("10")).toEqual(10);
    expect(subject.parse("11")).toEqual(11);
    expect(subject.parse("50")).toEqual(50);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a"); }).toThrow();
    expect(function () { subject.parse("0"); }).toThrow();
    expect(function () { subject.parse("01"); }).toThrow();
    expect(function () { subject.parse("-1"); }).toThrow();
    expect(function () { subject.parse("1a"); }).toThrow();
  });
});
