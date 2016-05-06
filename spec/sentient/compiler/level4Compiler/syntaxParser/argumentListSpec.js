"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("argumentList");

describe("argumentList", function () {
  it("accepts valid", function () {
    expect(subject.parse("a")).toEqual(["a"]);
    expect(subject.parse("a,b")).toEqual(["a", "b"]);
    expect(subject.parse("a, b")).toEqual(["a", "b"]);
    expect(subject.parse("a_b_0, foo")).toEqual(["a_b_0", "foo"]);
    expect(subject.parse("a \n , \n b")).toEqual(["a", "b"]);

    expect(subject.parse("*empty?")).toEqual(["*empty?"]);
    expect(subject.parse("*find!")).toEqual(["*find!"]);
    expect(subject.parse("*+")).toEqual(["*+"]);
    expect(subject.parse("*+, *foo")).toEqual(["*+", "*foo"]);
    expect(subject.parse("**")).toEqual(["**"]);
    expect(subject.parse("*&&")).toEqual(["*&&"]);

    expect(subject.parse("a, *foo, b, *&&")).toEqual(["a", "*foo", "b", "*&&"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
  });
});
