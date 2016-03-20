"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("typeBool", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
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
