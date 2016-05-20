"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprMethod");

describe("exprMethod", function () {
  it("accepts valid", function () {
    expect(subject.parse("a.abs")).toEqual(["abs", "a"]);
    expect(subject.parse("-123.abs")).toEqual(["abs", ["-@", 123]]);

    expect(subject.parse("arr.length")).toEqual(["length", "arr"]);
    expect(subject.parse("arr.get(i)")).toEqual(["get", "arr", "i"]);

    expect(subject.parse("arr.length()")).toEqual(["length", "arr"]);
    expect(subject.parse("-123.abs()")).toEqual(["abs", ["-@", 123]]);

    expect(subject.parse("foo.some_method(1, x, -2, !true)")).toEqual(
      ["some_method", "foo", 1, "x", ["-@", 2], ["!@", true]]
    );

    expect(subject.parse("-10.divmod")).toEqual(
      ["divmod", ["-@", 10]]
    );

    expect(subject.parse("-foo.bar.baz(1).qux(!false, 2)")).toEqual(
      ["qux", ["baz", ["bar", ["-@", "foo"]], 1], ["!@", false], 2]
    );

    expect(subject.parse("a.b(c.d(e), -f)")).toEqual(
      ["b", "a", ["d", "c", "e"], ["-@", "f"]]
    );

    expect(subject.parse("a.+(b)")).toEqual(["+", "a", "b"]);
    expect(subject.parse("a.a12?(b)")).toEqual(["a12?", "a", "b"]);
    expect(subject.parse("a.&&(b)")).toEqual(["&&", "a", "b"]);
    expect(subject.parse("a.-@")).toEqual(["-@", "a"]);

    expect(subject.parse("arr.empty?")).toEqual(["empty?", "arr"]);
    expect(subject.parse("arr.contains?(1)")).toEqual(["contains?", "arr", 1]);
    expect(subject.parse("arr.reverse!")).toEqual(["reverse!", "arr"]);
    expect(subject.parse("arr.cycle!(3)")).toEqual(["cycle!", "arr", 3]);

    expect(subject.parse("foo.bar(*baz)")).toEqual(["bar", "foo", "*baz"]);
    expect(subject.parse("x.y(*z, 123)")).toEqual(["y", "x", "*z", 123]);

    expect(subject.parse("-0")).toEqual(["-@", 0]);
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("foo..bar"); }).toThrow();
    expect(function () { subject.parse("foo.bar 123"); }).toThrow();
    expect(function () { subject.parse("foo .bar"); }).toThrow();
    expect(function () { subject.parse("foo.a.b."); }).toThrow();
    expect(function () { subject.parse("foo.bar..baz"); }).toThrow();
    expect(function () { subject.parse("foo.bar("); }).toThrow();
  });
});
