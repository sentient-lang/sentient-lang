"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("typeBool", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["typeBool"]
    });
  });

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
