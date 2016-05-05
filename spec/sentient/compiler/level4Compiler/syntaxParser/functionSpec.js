"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("function");

describe("function", function () {
  it("accepts valid", function () {
    expect(subject.parse("function noop () {}")).toEqual({
      name: "noop", args: [], body: [], ret: [0]
    });

    expect(subject.parse("function add (a, b) { return a + b; }")).toEqual({
      name: "add", args: ["a", "b"], body: [], ret: [1, ["+", "a", "b"]]
    });

    expect(subject.parse("function double(x){return x*2;}")).toEqual({
      name: "double", args: ["x"], body: [], ret: [1, ["*", "x", 2]]
    });

    expect(subject.parse("function zero? (x) { return x == 0; }")).toEqual({
      name: "zero?", args: ["x"], body: [], ret: [1, ["==", "x", 0]]
    });

    expect(
      subject.parse("function foo () { a = 1; b = 2; return3 a, b, 3; }")
    ).toEqual({
      name: "foo", args: [], body: [
        { type: "assignment", value: [["a"], [1]] },
        { type: "assignment", value: [["b"], [2]] }
      ], ret: [3, "a", "b", 3]
    });
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("functionfoo () {}"); }).toThrow();
    expect(function () { subject.parse("function () {}"); }).toThrow();
    expect(function () { subject.parse("function foo () {};"); }).toThrow();
  });
});
