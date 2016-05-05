"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("functionSignature");

describe("functionSignature", function () {
  it("accepts valid", function () {
    expect(subject.parse("function foo ()")).toEqual(["foo", []]);
    expect(subject.parse("function foo (a)")).toEqual(["foo", ["a"]]);
    expect(subject.parse("function foo (a, b)")).toEqual(["foo", ["a", "b"]]);
    expect(subject.parse("function double (x)")).toEqual(["double", ["x"]]);
    expect(subject.parse("function x( a , b )")).toEqual(["x", ["a", "b"]]);
    expect(subject.parse("function zero? (x)")).toEqual(["zero?", ["x"]]);
    expect(subject.parse("function +(x, y)")).toEqual(["+", ["x", "y"]]);
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
