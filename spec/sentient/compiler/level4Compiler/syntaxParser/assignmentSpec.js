"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("assignment", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["assignment"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a = b")).toEqual([["a"], ["b"]]);
    expect(subject.parse("a = true")).toEqual([["a"], [true]]);
    expect(subject.parse("a = b && c")).toEqual([["a"], [["b", ["c"], "&&"]]]);
    expect(subject.parse("foo_1 = -5")).toEqual([["foo_1"], [[5, "-"]]]);
    expect(subject.parse("a = b == c")).toEqual([["a"], [["b", ["c"], "=="]]]);
    expect(subject.parse("a, b = 1, 2")).toEqual([["a", "b"], [1, 2]]);

    expect(subject.parse("a, b, c = 1, x, true")).toEqual(
      [["a", "b", "c"], [1, "x", true]]
    );

    expect(subject.parse("a, b = x / 2, y + z")).toEqual(
      [["a", "b"], [["x", [2], "/"], ["y", ["z"], "+"]]]
    );

    expect(subject.parse("a, b, c = 1, a + a, b * b")).toEqual(
      [["a", "b", "c"], [1, ["a", ["a"], "+"], ["b", ["b"], "*"]]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a"); }).toThrow();
    expect(function () { subject.parse("a=b"); }).toThrow();
    expect(function () { subject.parse("a= b"); }).toThrow();
    expect(function () { subject.parse("a =b"); }).toThrow();
    expect(function () { subject.parse("a = b = c"); }).toThrow();
    expect(function () { subject.parse("a == b"); }).toThrow();
    expect(function () { subject.parse("1 = a"); }).toThrow();
    expect(function () { subject.parse("a, = 1"); }).toThrow();
    expect(function () { subject.parse("a, b = 1 1"); }).toThrow();
  });
});
