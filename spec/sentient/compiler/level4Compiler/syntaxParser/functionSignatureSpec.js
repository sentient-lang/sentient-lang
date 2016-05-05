"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("functionSignature");

describe("functionSignature", function () {
  it("accepts valid", function () {
    expect(subject.parse("function foo ()")).toEqual(["foo", false, []]);
    expect(subject.parse("function foo (a)")).toEqual(["foo", false, ["a"]]);
    expect(subject.parse("function foo (a, b)")).toEqual(
      ["foo", false, ["a", "b"]]
    );
    expect(subject.parse("function double (x)")).toEqual(
      ["double", false, ["x"]]
    );
    expect(subject.parse("function x( a , b )")).toEqual(
      ["x", false, ["a", "b"]]
    );
    expect(subject.parse("function zero? (x)")).toEqual(
      ["zero?", false, ["x"]]
    );
    expect(subject.parse("function +(x, y)")).toEqual(["+", false, ["x", "y"]]);
    expect(subject.parse("function^ incr ()")).toEqual(["incr", true, []]);
    expect(subject.parse("function^ add (x)")).toEqual(["add", true, ["x"]]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("function foo"); }).toThrow();
    expect(function () { subject.parse("function foo (a b)"); }).toThrow();
    expect(function () { subject.parse("function foo (a,)"); }).toThrow();
    expect(function () { subject.parse("function foo bar ()"); }).toThrow();
    expect(function () { subject.parse("foo ()"); }).toThrow();
    expect(function () { subject.parse("function () ()"); }).toThrow();
    expect(function () { subject.parse("function foo (2)"); }).toThrow();
    expect(function () { subject.parse("function foo (a + b)"); }).toThrow();
  });
});
