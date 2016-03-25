"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("expression", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["expression"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("(a)")).toEqual("a");
    expect(subject.parse("((123))")).toEqual(123);
    expect(subject.parse("((((true))))")).toEqual(true);

    expect(subject.parse("a && (b || c)")).toEqual(
      ["a", ["b", "c", "||"], "&&"]
    );

    expect(subject.parse("1 > 2 && 3 <= 4 / (1 + 2)")).toEqual(
      [[1, 2, ">"], [3, [4, [1, 2, "+"], "/"], "<="], "&&"]
    );

    expect(subject.parse("(a < b) || (b < c)")).toEqual(
      [["a", "b", "<"], ["b", "c", "<"], "||"]
    );

    expect(subject.parse("a * (b.abs + c.get(-1.abs))")).toEqual(
      ["a", [["b", [], "abs"], ["c", [[[1, "-"], [], "abs"]], "get"], "+"], "*"]
    );

    expect(subject.parse("arr.empty? || true")).toEqual(
      [["arr", [], "empty?"], true, "||"]
    );

    expect(subject.parse("a.abs")).toEqual(["a", [], "abs"]);
    expect(subject.parse("a.b(1 + 1)")).toEqual(["a", [[1, 1, "+"]], "b"]);
    expect(subject.parse("a || b && c")).toEqual(["a", ["b", "c", "&&"], "||"]);
    expect(subject.parse("a && b == c")).toEqual(["a", ["b", "c", "=="], "&&"]);
    expect(subject.parse("a == b < c")).toEqual(["a", ["b", "c", "<"], "=="]);
    expect(subject.parse("1 < 2")).toEqual([1, 2, "<"]);
    expect(subject.parse("a >= b / c")).toEqual(["a", ["b", "c", "/"], ">="]);
    expect(subject.parse("1 + 2 / 3")).toEqual([1, [2, 3, "/"], "+"]);
    expect(subject.parse("-3")).toEqual([3, "-"]);
    expect(subject.parse("!foo")).toEqual(["foo", "!"]);
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("()"); }).toThrow();
    expect(function () { subject.parse(")("); }).toThrow();
    expect(function () { subject.parse("(1))"); }).toThrow();
    expect(function () { subject.parse("(1 2)"); }).toThrow();
    expect(function () { subject.parse("(1, 2)"); }).toThrow();
  });
});
