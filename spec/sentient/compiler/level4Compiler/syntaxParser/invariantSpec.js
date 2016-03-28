"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("invariant");

describe("invariant", function () {
  it("accepts valid", function () {
    expect(subject.parse("invariant a, b, c")).toEqual(["a", "b", "c"]);
    expect(subject.parse("invariant foo_123")).toEqual(["foo_123"]);
    expect(subject.parse("invariant true")).toEqual([true]);
    expect(subject.parse("invariant a && b")).toEqual([["a", ["b"], "&&"]]);

    expect(subject.parse("invariant 1 < 2, !foo, 4 >= 3, bar")).toEqual(
      [[1, [2], "<"], ["foo", "!"], [4, [3], ">="], "bar"]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("invariant"); }).toThrow();
    expect(function () { subject.parse("invarianta"); }).toThrow();
    expect(function () { subject.parse("invariant a,"); }).toThrow();
    expect(function () { subject.parse("invariant a = b"); }).toThrow();
    expect(function () { subject.parse("invariant a b"); }).toThrow();
  });
});
