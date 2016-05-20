"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("expose");

describe("expose", function () {
  it("accepts valid", function () {
    expect(subject.parse("expose a, b, c")).toEqual(["a", "b", "c"]);
    expect(subject.parse("expose foo_123")).toEqual(["foo_123"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("expose"); }).toThrow();
    expect(function () { subject.parse("expose"); }).toThrow();
    expect(function () { subject.parse("expose a,"); }).toThrow();
    expect(function () { subject.parse("expose a, 123"); }).toThrow();
    expect(function () { subject.parse("expose a, b && c"); }).toThrow();
    expect(function () { subject.parse("expose a, true"); }).toThrow();
  });
});
