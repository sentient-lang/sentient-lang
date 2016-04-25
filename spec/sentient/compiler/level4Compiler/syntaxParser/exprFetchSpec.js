"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprFetch");

describe("exprFetch", function () {
  it("accepts valid", function () {
    expect(subject.parse("arr[0]")).toEqual(["[]", "arr", 0]);
    expect(subject.parse("arr[a]")).toEqual(["[]", "arr", "a"]);
    expect(subject.parse("arr[ 1 ]")).toEqual(["[]", "arr", 1]);
    expect(subject.parse("arr[-1]")).toEqual(["[]", "arr", ["-@", 1]]);
    expect(subject.parse("x[1 + 2]")).toEqual(["[]", "x", ["+", 1, 2]]);

    expect(subject.parse("arr[0][1 * 2]")).toEqual(
      ["[]", ["[]", "arr", 0], ["*", 1, 2]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("arr[]"); }).toThrow();
    expect(function () { subject.parse("arr[1, 2]"); }).toThrow();
  });
});
