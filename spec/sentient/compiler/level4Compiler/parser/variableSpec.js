"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("variable", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
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
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("A"); }).toThrow();
    expect(function () { subject.parse("aB"); }).toThrow();
    expect(function () { subject.parse("0a"); }).toThrow();
    expect(function () { subject.parse("_a"); }).toThrow();
    expect(function () { subject.parse("3"); }).toThrow();
    expect(function () { subject.parse("_"); }).toThrow();
  });
});
