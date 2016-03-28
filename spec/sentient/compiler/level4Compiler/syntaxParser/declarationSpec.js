"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("declaration");

describe("declaration", function () {
  it("accepts valid", function () {
    expect(subject.parse("bool a")).toEqual([["bool"], ["a"]]);
    expect(subject.parse("bool a, b, c")).toEqual([["bool"], ["a", "b", "c"]]);
    expect(subject.parse("int a, b")).toEqual([["int"], ["a", "b"]]);
    expect(subject.parse("int3 a, b")).toEqual([["int", 3], ["a", "b"]]);

    expect(subject.parse("array3<bool> a, b")).toEqual(
      [["array", 3, "bool"], ["a", "b"]]
    );

    expect(subject.parse("array3<array2<int6>> a__ #,#, \n , b_c0_")).toEqual(
      [["array", 3, "array", 2, "int", 6], ["a__", "b_c0_"]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse(" bool a"); }).toThrow();
    expect(function () { subject.parse("bool a "); }).toThrow();
    expect(function () { subject.parse("a, b, c"); }).toThrow();
    expect(function () { subject.parse("bool"); }).toThrow();
    expect(function () { subject.parse("int , a"); }).toThrow();
    expect(function () { subject.parse("int6a"); }).toThrow();
    expect(function () { subject.parse("array<bool> b"); }).toThrow();
  });
});
