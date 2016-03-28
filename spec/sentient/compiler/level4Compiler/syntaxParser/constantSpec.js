"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("constant");

describe("constant", function () {
  it("accepts valid", function () {
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("0")).toEqual(0);
    expect(subject.parse("1")).toEqual(1);
    expect(subject.parse("2")).toEqual(2);
    expect(subject.parse("10")).toEqual(10);
    expect(subject.parse("11")).toEqual(11);
    expect(subject.parse("1234")).toEqual(1234);
    expect(subject.parse("01")).toEqual(1);
    expect(subject.parse("000123")).toEqual(123);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("TRUE"); }).toThrow();
    expect(function () { subject.parse("T"); }).toThrow();
    expect(function () { subject.parse("a"); }).toThrow();
    expect(function () { subject.parse("1a"); }).toThrow();
    expect(function () { subject.parse("1 1"); }).toThrow();
    expect(function () { subject.parse("--1"); }).toThrow();
    expect(function () { subject.parse("1-1"); }).toThrow();
    expect(function () { subject.parse("-"); }).toThrow();
    expect(function () { subject.parse("-1"); }).toThrow();
    expect(function () { subject.parse("-0"); }).toThrow();
  });
});
