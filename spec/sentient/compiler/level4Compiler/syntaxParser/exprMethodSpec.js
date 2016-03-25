"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("exprMethod", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["exprMethod"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a.abs")).toEqual(["a", [], "abs"]);
    expect(subject.parse("-123.abs")).toEqual([[123, "-"], [], "abs"]);

    expect(subject.parse("arr.length")).toEqual(["arr", [], "length"]);
    expect(subject.parse("arr.get(i)")).toEqual(["arr", ["i"], "get"]);

    expect(subject.parse("arr.length()")).toEqual(["arr", [], "length"]);
    expect(subject.parse("-123.abs()")).toEqual([[123, "-"], [], "abs"]);

    expect(subject.parse("foo.some_method(1, x, -2, !true)")).toEqual(
      ["foo", [1, "x", [2, "-"], [true, "!"]], "some_method"]
    );

    expect(subject.parse("-10.divmod")).toEqual(
      [[10, "-"], [], "divmod"]
    );

    expect(subject.parse("-foo.bar.baz(1).qux(!false, 2)")).toEqual(
      [[[["foo", "-"], [], "bar"], [1], "baz"], [[false, "!"], 2], "qux"]
    );

    expect(subject.parse("a.b(c.d(e), -f)")).toEqual(
      ["a", [["c", ["e"], "d"], ["f", "-"]], "b"]
    );

    expect(subject.parse("arr.empty?")).toEqual(["arr", [], "empty?"]);
    expect(subject.parse("arr.contains?(1)")).toEqual(
      ["arr", [1], "contains?"]
    );
    expect(subject.parse("arr.reverse!")).toEqual(["arr", [], "reverse!"]);
    expect(subject.parse("arr.cycle!(3)")).toEqual(
      ["arr", [3], "cycle!"]
    );

    expect(subject.parse("-0")).toEqual([0, "-"]);
    expect(subject.parse("!true")).toEqual([true, "!"]);
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
    expect(function () { subject.parse("foo.bar??"); }).toThrow();
    expect(function () { subject.parse("foo.bar!!"); }).toThrow();
    expect(function () { subject.parse("foo.bar?!"); }).toThrow();
  });
});
