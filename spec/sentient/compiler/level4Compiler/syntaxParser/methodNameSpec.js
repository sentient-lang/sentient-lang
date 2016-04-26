"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("methodName");

describe("methodName", function () {
  it("accepts valid", function () {
    expect(subject.parse("foo")).toEqual("foo");
    expect(subject.parse("foo_bar")).toEqual("foo_bar");
    expect(subject.parse("a123")).toEqual("a123");
    expect(subject.parse("empty?")).toEqual("empty?");
    expect(subject.parse("find!")).toEqual("find!");
    expect(subject.parse("+")).toEqual("+");
    expect(subject.parse("&&")).toEqual("&&");
    expect(subject.parse("[]")).toEqual("[]");
    expect(subject.parse("!@")).toEqual("!@");
    expect(subject.parse("==")).toEqual("==");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a.b"); }).toThrow();
    expect(function () { subject.parse("a..b"); }).toThrow();
    expect(function () { subject.parse("a(b"); }).toThrow();
    expect(function () { subject.parse("a()"); }).toThrow();
    expect(function () { subject.parse("a b"); }).toThrow();
    expect(function () { subject.parse("]["); }).toThrow();
    expect(function () { subject.parse("!"); }).toThrow();
    expect(function () { subject.parse("==="); }).toThrow();
  });
});
