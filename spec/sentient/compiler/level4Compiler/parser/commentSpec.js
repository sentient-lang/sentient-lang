"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("comment", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
      allowedStartRules: ["comment"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("# foo bar")).toEqual("");
    expect(subject.parse("#foo bar")).toEqual("");
    expect(subject.parse("###")).toEqual("");
    expect(subject.parse("### ----- foo 123")).toEqual("");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("foo bar"); }).toThrow();
    expect(function () { subject.parse("# foo \n"); }).toThrow();
    expect(function () { subject.parse("a # b"); }).toThrow();
    expect(function () { subject.parse("// foo"); }).toThrow();
    expect(function () { subject.parse("   # foo"); }).toThrow();
  });
});
