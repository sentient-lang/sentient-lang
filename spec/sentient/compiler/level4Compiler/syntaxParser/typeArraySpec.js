"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("typeArray");

describe("typeArray", function () {
  it("accepts valid", function () {
    expect(subject.parse("array3<bool>")).toEqual(["array", 3, "bool"]);
    expect(subject.parse("array4<int>")).toEqual(["array", 4, "int"]);
    expect(subject.parse("array5<int6>")).toEqual(["array", 5, "int", 6]);

    expect(subject.parse("array6<array3<bool>>")).toEqual(
      ["array", 6, "array", 3, "bool"]
    );

    expect(subject.parse("array7<array5<array3<int1>>>")).toEqual(
      ["array", 7, "array", 5, "array", 3, "int", 1]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("array"); }).toThrow();
    expect(function () { subject.parse("array3"); }).toThrow();
    expect(function () { subject.parse("array<bool>"); }).toThrow();
    expect(function () { subject.parse("array<int2>"); }).toThrow();
    expect(function () { subject.parse("array0<bool>"); }).toThrow();
    expect(function () { subject.parse("array3<bool>>"); }).toThrow();
    expect(function () { subject.parse("array3<<bool>>"); }).toThrow();
    expect(function () { subject.parse("array3<array2>"); }).toThrow();
    expect(function () { subject.parse("array3<array2<int>"); }).toThrow();
  });
});
