"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("variable");

describe("variable", function () {
  it("accepts valid", function () {
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("abc")).toEqual("abc");
    expect(subject.parse("a_b_c")).toEqual("a_b_c");
    expect(subject.parse("a0")).toEqual("a0");
    expect(subject.parse("a12")).toEqual("a12");
    expect(subject.parse("a12_3b")).toEqual("a12_3b");
    expect(subject.parse("a_")).toEqual("a_");
    expect(subject.parse("true_x")).toEqual("true_x");
    expect(subject.parse("x_false")).toEqual("x_false");
    expect(subject.parse("fooBar")).toEqual("fooBar");
    expect(subject.parse("SHOUTY")).toEqual("SHOUTY");
    expect(subject.parse("A_bC0")).toEqual("A_bC0");
    expect(subject.parse("trueA")).toEqual("trueA");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("0a"); }).toThrow();
    expect(function () { subject.parse("_a"); }).toThrow();
    expect(function () { subject.parse("3"); }).toThrow();
    expect(function () { subject.parse("_"); }).toThrow();
    expect(function () { subject.parse("true"); }).toThrow();
    expect(function () { subject.parse("false"); }).toThrow();
  });
});
