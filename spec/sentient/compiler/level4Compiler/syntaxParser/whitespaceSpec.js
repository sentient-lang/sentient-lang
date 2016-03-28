"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("whitespace");

describe("whitespace", function () {
  it("gathers whitespace to help readability", function () {
    expect(subject.parse(" ")).toEqual(" ");
    expect(subject.parse("   ")).toEqual(" ");
    expect(subject.parse(" \t  ")).toEqual(" ");
    expect(subject.parse(" \t \n ")).toEqual(" ");
    expect(subject.parse("\n\n\n\ \t \n  \t\t \t")).toEqual(" ");
    expect(subject.parse("   # comment")).toEqual(" ");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse(" a "); }).toThrow();
  });
});
