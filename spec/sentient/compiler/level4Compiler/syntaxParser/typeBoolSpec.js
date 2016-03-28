"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("typeBool");

describe("typeBool", function () {
  it("accepts valid", function () {
    expect(subject.parse("bool")).toEqual(["bool"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("boolean"); }).toThrow();
    expect(function () { subject.parse("bool3"); }).toThrow();
    expect(function () { subject.parse("bool<bool>"); }).toThrow();
  });
});
