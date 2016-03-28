"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("vary");

describe("vary", function () {
  it("accepts valid", function () {
    expect(subject.parse("vary a, b, c")).toEqual(["a", "b", "c"]);
    expect(subject.parse("vary foo_123")).toEqual(["foo_123"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("vary"); }).toThrow();
    expect(function () { subject.parse("varya"); }).toThrow();
    expect(function () { subject.parse("vary a,"); }).toThrow();
    expect(function () { subject.parse("vary a, 123"); }).toThrow();
    expect(function () { subject.parse("vary a, b && c"); }).toThrow();
    expect(function () { subject.parse("vary a, true"); }).toThrow();
  });
});
