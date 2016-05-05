"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("functionBody");

describe("functionBody", function () {
  it("accepts valid", function () {
    expect(subject.parse("{}")).toEqual([[], [0]]);
    expect(subject.parse("{ return; }")).toEqual([[], [0]]);
    expect(subject.parse("{ return 123; }")).toEqual([[], [1, 123]]);
    expect(subject.parse("{ return 2 + 2; }")).toEqual([[], [1, ["+", 2, 2]]]);
    expect(subject.parse("{ return2 123, 456; }")).toEqual([[], [2, 123, 456]]);

    expect(subject.parse("{ a = 123; return a; }")).toEqual(
      [[{ type: "assignment", value: [["a"], [123]] }], [1, "a"]]
    );

    expect(subject.parse("{ invariant foo; }")).toEqual(
      [[{ type: "invariant", value: ["foo"] }], [0]]
    );

    expect(subject.parse("{ a += b; }")).toEqual(
      [[{ type: "assignment", value: [["a"], [["+", "a", "b"]]] }], [0]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("{"); }).toThrow();
    expect(function () { subject.parse("}"); }).toThrow();
    expect(function () { subject.parse("{}}"); }).toThrow();
    expect(function () { subject.parse("{ return; a = 1; }"); }).toThrow();
    expect(function () { subject.parse("{ return1 123, 456; }"); }).toThrow();
  });
});
