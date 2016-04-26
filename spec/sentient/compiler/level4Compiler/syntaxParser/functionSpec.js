"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("function");

describe("exprUnary", function () {
  it("accepts valid", function () {
    expect(subject.parse("function add (a, b) { return a + b; }"));
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
  });
});
