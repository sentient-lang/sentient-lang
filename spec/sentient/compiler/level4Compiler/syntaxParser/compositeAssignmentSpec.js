"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("compositeAssignment", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["compositeAssignment"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a += b")).toEqual([["a"], [["a", ["b"], "+"]]]);
    expect(subject.parse("a -= b")).toEqual([["a"], [["a", ["b"], "-"]]]);
    expect(subject.parse("a *= b")).toEqual([["a"], [["a", ["b"], "*"]]]);
    expect(subject.parse("a /= b")).toEqual([["a"], [["a", ["b"], "/"]]]);
    expect(subject.parse("a %= b")).toEqual([["a"], [["a", ["b"], "%"]]]);
    expect(subject.parse("a &&= b")).toEqual([["a"], [["a", ["b"], "&&"]]]);
    expect(subject.parse("a ||= b")).toEqual([["a"], [["a", ["b"], "||"]]]);

    expect(subject.parse("a += 1 + 2")).toEqual(
      [["a"], [["a", [[1, [2], "+"]], "+"]]]
    );
    expect(subject.parse("a -= 1 + 2")).toEqual(
      [["a"], [["a", [[1, [2], "+"]], "-"]]]
    );
    expect(subject.parse("a *= 1 + 2")).toEqual(
      [["a"], [["a", [[1, [2], "+"]], "*"]]]
    );
    expect(subject.parse("a /= 1 + 2")).toEqual(
      [["a"], [["a", [[1, [2], "+"]], "/"]]]
    );
    expect(subject.parse("a %= 1 + 2")).toEqual(
      [["a"], [["a", [[1, [2], "+"]], "%"]]]
    );
    expect(subject.parse("a &&= true == false")).toEqual(
      [["a"], [["a", [[true, [false], "=="]], "&&"]]]
    );
    expect(subject.parse("a ||= true == false")).toEqual(
      [["a"], [["a", [[true, [false], "=="]], "||"]]]
    );

    expect(subject.parse("a||=true==false")).toEqual(
      [["a"], [["a", [[true, [false], "=="]], "||"]]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a == b"); }).toThrow();
    expect(function () { subject.parse("a != b"); }).toThrow();
    expect(function () { subject.parse("a <= b"); }).toThrow();
    expect(function () { subject.parse("a &= b"); }).toThrow();
    expect(function () { subject.parse("a |= b"); }).toThrow();
    expect(function () { subject.parse("a += b += c"); }).toThrow();
    expect(function () { subject.parse("1 += b"); }).toThrow();
    expect(function () { subject.parse("a, b += 1"); }).toThrow();
    expect(function () { subject.parse("a, b += 1, 1"); }).toThrow();
  });
});
