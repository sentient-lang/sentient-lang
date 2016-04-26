"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprFunction");

describe("exprFunction", function () {
  it("accepts valid", function () {
    expect(subject.parse("abs(a)")).toEqual(["abs", "a"]);
    expect(subject.parse("abs(-123)")).toEqual(["abs", ["-@", 123]]);
    expect(subject.parse("get(arr, i)")).toEqual(["get", "arr", "i"]);
    expect(subject.parse("update()")).toEqual(["update"]);
    expect(subject.parse("a( b(c(1, 2)) )")).toEqual(["a", ["b", ["c", 1, 2]]]);
    expect(subject.parse("a(b.c)")).toEqual(["a", ["c", "b"]]);
    expect(subject.parse("a(b.c(d(e)))")).toEqual(["a",["c", "b", ["d", "e"]]]);

    expect(subject.parse("some_method(foo, 1, x, -2, !true)")).toEqual(
      ["some_method", "foo", 1, "x", ["-@", 2], ["!@", true]]
    );

    expect(subject.parse("seven?(array[3] + 1)")).toEqual(
      ["seven?", ["+", ["[]", "array", 3], 1]]
    );

    expect(subject.parse("+(1, 2)")).toEqual(["+", 1, 2]);
    expect(subject.parse("&&(a, b)")).toEqual(["&&", "a", "b"]);
    expect(subject.parse("-@(a)")).toEqual(["-@", "a"]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("foo(a"); }).toThrow();
    expect(function () { subject.parse("foo (a)"); }).toThrow();
    expect(function () { subject.parse("a,b(c)"); }).toThrow();
    expect(function () { subject.parse("++(a)"); }).toThrow();
    expect(function () { subject.parse("foo??(bar)"); }).toThrow();
  });
});
