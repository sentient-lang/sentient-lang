"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var Parser = require(compiler + "/level4Compiler/parser");

describe("exprComparative", function () {
  var subject;

  beforeEach(function () {
    subject = new Parser({
      allowedStartRules: ["exprComparative"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("1 < 2")).toEqual([1, 2, "<"]);
    expect(subject.parse("1 + 2 < a")).toEqual([[1, 2, "+"], "a", "<"]);
    expect(subject.parse("a < -1 + b / c")).toEqual(
      ["a", [[1, "-"], ["b", "c", "/"], "+"], "<"]
    );

    expect(subject.parse("1 >= 2")).toEqual([1, 2, ">="]);
    expect(subject.parse("1 + 2 >= a")).toEqual([[1, 2, "+"], "a", ">="]);
    expect(subject.parse("a >= -1 + b / c")).toEqual(
      ["a", [[1, "-"], ["b", "c", "/"], "+"], ">="]
    );

    expect(subject.parse("1 <= 2")).toEqual([1, 2, "<="]);
    expect(subject.parse("1 + 2 <= a")).toEqual([[1, 2, "+"], "a", "<="]);
    expect(subject.parse("a <= -1 + b / c")).toEqual(
      ["a", [[1, "-"], ["b", "c", "/"], "+"], "<="]
    );

    expect(subject.parse("1 > 2")).toEqual([1, 2, ">"]);
    expect(subject.parse("1 + 2 > a")).toEqual([[1, 2, "+"], "a", ">"]);
    expect(subject.parse("a > -1 + b / c")).toEqual(
      ["a", [[1, "-"], ["b", "c", "/"], "+"], ">"]
    );

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
    expect(function () { subject.parse("1 < 2 < 3"); }).toThrow();
    expect(function () { subject.parse("1 < 2 >= 3"); }).toThrow();
    expect(function () { subject.parse("1 << 2"); }).toThrow();
    expect(function () { subject.parse("a > < b"); }).toThrow();
  });
});
