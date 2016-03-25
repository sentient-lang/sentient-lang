"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("type", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["type"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("bool")).toEqual(["bool"]);
    expect(subject.parse("int")).toEqual(["int"]);
    expect(subject.parse("int3")).toEqual(["int", 3]);
    expect(subject.parse("array5<bool>")).toEqual(["array", 5, "bool"]);
    expect(subject.parse("array5<int3>")).toEqual(["array", 5, "int", 3]);

    expect(subject.parse("array5<array2<array3<int4>>>")).toEqual(
      ["array", 5, "array", 2, "array", 3, "int", 4]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("integer"); }).toThrow();
    expect(function () { subject.parse("bool3"); }).toThrow();
    expect(function () { subject.parse("array<bool>"); }).toThrow();
    expect(function () { subject.parse("int<bool>"); }).toThrow();
  });
});
