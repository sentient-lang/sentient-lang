"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("exprPrimary", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["exprPrimary"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("0")).toEqual(0);
    expect(subject.parse("1")).toEqual(1);
    expect(subject.parse("123")).toEqual(123);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
    expect(subject.parse("a_b_0")).toEqual("a_b_0");
    expect(subject.parse("truex")).toEqual("truex");
    expect(subject.parse("xfalse")).toEqual("xfalse");
    expect(subject.parse("true_false")).toEqual("true_false");
    expect(subject.parse("false1")).toEqual("false1");
    expect(subject.parse("[1, 2]")).toEqual([1, [2], "collect"]);
    expect(subject.parse("[a, true]")).toEqual(["a", [true], "collect"]);
    expect(subject.parse("[ 1 ]")).toEqual([1, [], "collect"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("1a"); }).toThrow();
    expect(function () { subject.parse("1 1"); }).toThrow();
    expect(function () { subject.parse("_a"); }).toThrow();
    expect(function () { subject.parse("[]"); }).toThrow();
    expect(function () { subject.parse("[1 1]"); }).toThrow();
  });
});
