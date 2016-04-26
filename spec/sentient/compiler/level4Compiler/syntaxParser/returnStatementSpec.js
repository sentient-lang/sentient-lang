"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("returnStatement");

describe("returnStatement", function () {
  it("accepts valid", function () {
    expect(subject.parse("return 123;")).toEqual([123]);
    expect(subject.parse("return a, b;")).toEqual(["a", "b"]);
    expect(subject.parse("return true, ABC;")).toEqual([true, "ABC"]);
    expect(subject.parse("return 1 + 1;")).toEqual([["+", 1, 1]]);
    expect(subject.parse("return [1], x;")).toEqual([["collect", 1], "x"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
  });
});
