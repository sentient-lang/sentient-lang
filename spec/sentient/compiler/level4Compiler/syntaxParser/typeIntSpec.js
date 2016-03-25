"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("typeInt", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["typeInt"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("int")).toEqual(["int"]);
    expect(subject.parse("int3")).toEqual(["int", 3]);
    expect(subject.parse("int8")).toEqual(["int", 8]);
    expect(subject.parse("int10")).toEqual(["int", 10]);
    expect(subject.parse("int12")).toEqual(["int", 12]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("integer"); }).toThrow();
    expect(function () { subject.parse("int0"); }).toThrow();
    expect(function () { subject.parse("int01"); }).toThrow();
    expect(function () { subject.parse("int<int>"); }).toThrow();
  });
});
