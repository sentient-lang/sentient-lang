"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("variable", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["variable"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("abc")).toEqual("abc");
    expect(subject.parse("a_b_c")).toEqual("a_b_c");
    expect(subject.parse("a0")).toEqual("a0");
    expect(subject.parse("a12")).toEqual("a12");
    expect(subject.parse("a12_3b")).toEqual("a12_3b");
    expect(subject.parse("a_")).toEqual("a_");
    expect(subject.parse("true_x")).toEqual("true_x");
    expect(subject.parse("x_false")).toEqual("x_false");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("A"); }).toThrow();
    expect(function () { subject.parse("aB"); }).toThrow();
    expect(function () { subject.parse("0a"); }).toThrow();
    expect(function () { subject.parse("_a"); }).toThrow();
    expect(function () { subject.parse("3"); }).toThrow();
    expect(function () { subject.parse("_"); }).toThrow();
    expect(function () { subject.parse("true"); }).toThrow();
    expect(function () { subject.parse("false"); }).toThrow();
  });
});
