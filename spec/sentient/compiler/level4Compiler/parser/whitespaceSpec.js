"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("whitespace", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
      allowedStartRules: ["whitespace"]
    });
  });

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
