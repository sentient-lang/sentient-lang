"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("returnStatement");

describe("returnStatement", function () {
  it("accepts valid", function () {
    expect(subject.parse("return 123;")).toEqual([1, 123]);
    expect(subject.parse("return 123, 456;")).toEqual([2, 123, 456]);
    expect(subject.parse("return 2 + 2;")).toEqual([1, ["+", 2, 2]]);
    expect(subject.parse("return true, ABC;")).toEqual([2, true, "ABC"]);
    expect(subject.parse("return [1],x;")).toEqual([2, ["buildArray", 1], "x"]);
    expect(subject.parse("return 3.divmod(2);")).toEqual([1, ["divmod", 3, 2]]);
    expect(subject.parse("return2 3.divmod(2);")).toEqual([2,["divmod", 3, 2]]);
    expect(subject.parse("return foo();")).toEqual([1, ["foo"]]);
    expect(subject.parse("return1 foo();")).toEqual([1, ["foo"]]);
    expect(subject.parse("return5 foo();")).toEqual([5, ["foo"]]);
    expect(subject.parse("return55 foo();")).toEqual([55, ["foo"]]);
    expect(subject.parse("return 123 ; ; ; ;")).toEqual([1, 123]);
    expect(subject.parse("return 123;;;;")).toEqual([1, 123]);
    expect(subject.parse("return;")).toEqual([0]);
    expect(subject.parse("return ;")).toEqual([0]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("return0;"); }).toThrow();
    expect(function () { subject.parse("return1;"); }).toThrow();
    expect(function () { subject.parse("return2;"); }).toThrow();
    expect(function () { subject.parse("return0 123;"); }).toThrow();
    expect(function () { subject.parse("return1 123, 456;"); }).toThrow();
    expect(function () { subject.parse("return2 123, 456, 789;"); }).toThrow();
    expect(function () { subject.parse("return123;"); }).toThrow();
    expect(function () { subject.parse("return 123"); }).toThrow();
  });
});
