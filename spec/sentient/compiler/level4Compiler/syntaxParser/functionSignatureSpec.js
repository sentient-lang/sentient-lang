"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("functionSignature");

describe("functionSignature", function () {
  it("accepts valid", function () {
    expect(subject.parse("function foo ()")).toEqual(
      ["foo", false, false, []]
    );
    expect(subject.parse("function foo (a)")).toEqual(
      ["foo", false, false, ["a"]]
    );
    expect(subject.parse("function foo (a, b)")).toEqual(
      ["foo", false, false, ["a", "b"]]
    );
    expect(subject.parse("function double (x)")).toEqual(
      ["double", false, false, ["x"]]
    );
    expect(subject.parse("function x( a , b )")).toEqual(
      ["x", false, false, ["a", "b"]]
    );
    expect(subject.parse("function zero? (x)")).toEqual(
      ["zero?", false, false, ["x"]]
    );
    expect(subject.parse("function +(x, y)")).toEqual(
      ["+", false, false, ["x", "y"]]
    );
    expect(subject.parse("function^ incr ()")).toEqual(
      ["incr", true, false, []]
    );
    expect(subject.parse("function^ add (x)")).toEqual(
      ["add", true, false, ["x"]]
    );
    expect(subject.parse("function (x)")).toEqual(
      ["_anonymous", false, false, ["x"]]
    );
    expect(subject.parse("function^ (x)")).toEqual(
      ["_anonymous", true, false, ["x"]]
    );
    expect(subject.parse("function foo& (x)")).toEqual(
      ["foo", false, true, ["x"]]
    );
    expect(subject.parse("function^ foo& (x)")).toEqual(
      ["foo", true, true, ["x"]]
    );
    expect(subject.parse("function^ &&& (x)")).toEqual(
      ["&&", true, true, ["x"]]
    );
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
