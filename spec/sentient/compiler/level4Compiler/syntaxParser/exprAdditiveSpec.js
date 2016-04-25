"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprAdditive");

describe("exprAdditive", function () {
  it("accepts valid", function () {
    expect(subject.parse("1 + 2")).toEqual(["+", 1, 2]);
    expect(subject.parse("a + b")).toEqual(["+", "a", "b"]);
    expect(subject.parse("a + b / c")).toEqual(["+", "a", ["/", "b", "c"]]);
    expect(subject.parse("a * b + c")).toEqual(["+", ["*", "a", "b"], "c"]);
    expect(subject.parse("a + b + c")).toEqual(["+", ["+", "a", "b"], "c"]);

    expect(subject.parse("1 - 2")).toEqual(["-", 1, 2]);
    expect(subject.parse("a - b")).toEqual(["-", "a", "b"]);
    expect(subject.parse("a - b / c")).toEqual(["-", "a", ["/", "b", "c"]]);
    expect(subject.parse("a * b - c")).toEqual(["-", ["*", "a", "b"], "c"]);
    expect(subject.parse("a - b - c")).toEqual(["-", ["-", "a", "b"], "c"]);

    expect(subject.parse("a + b - c")).toEqual(["-", ["+", "a", "b"], "c"]);
    expect(subject.parse("a - b + c")).toEqual(["+", ["-", "a", "b"], "c"]);

    expect(subject.parse("a - -b - c")).toEqual(
      ["-", ["-", "a", ["-@", "b"]], "c"]
    );

    expect(subject.parse("a--b-c")).toEqual(
      ["-", ["-", "a", ["-@", "b"]], "c"]
    );

    expect(subject.parse("a * b")).toEqual(["*", "a", "b"]);
    expect(subject.parse("1 / 2 % 3")).toEqual(["%", ["/", 1, 2], 3]);
    expect(subject.parse("-3")).toEqual(["-@", 3]);
    expect(subject.parse("!foo")).toEqual(["!@", "foo"]);
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("+"); }).toThrow();
    expect(function () { subject.parse("-"); }).toThrow();
    expect(function () { subject.parse("a +"); }).toThrow();
    expect(function () { subject.parse("+ a"); }).toThrow();
    expect(function () { subject.parse("+a"); }).toThrow();
    expect(function () { subject.parse("- a"); }).toThrow();
    expect(function () { subject.parse("a ++ b"); }).toThrow();
    expect(function () { subject.parse("a--"); }).toThrow();
  });
});
