"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("destructuredAssignment");

describe("destructuredAssignment", function () {
  it("accepts valid", function () {
    expect(subject.parse("div, mod =* 3.divmod(2)")).toEqual(
      [["div", "mod"], [3, [2], "divmod"]]
    );

    expect(subject.parse("a, a_present =* arr.get(3)")).toEqual(
      [["a", "a_present"], ["arr", [3], "get"]]
    );

    expect(subject.parse("a, b, c =* foo.returns_three_things")).toEqual(
      [["a", "b", "c"], ["foo", [], "returns_three_things"]]
    );

    expect(subject.parse("a,b,c=*foo.returns_three_things")).toEqual(
      [["a", "b", "c"], ["foo", [], "returns_three_things"]]
    );

    expect(subject.parse("a =* 123")).toEqual(
      [["a"], 123]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a =*"); }).toThrow();
    expect(function () { subject.parse("a, b =* 1, 2"); }).toThrow();
    expect(function () { subject.parse("1 =* 1"); }).toThrow();
  });
});
