"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("expression");

describe("expression", function () {
  it("accepts valid", function () {
    expect(subject.parse("(a)")).toEqual("a");
    expect(subject.parse("((123))")).toEqual(123);
    expect(subject.parse("((((true))))")).toEqual(true);

    expect(subject.parse("a && (b || c)")).toEqual(
      ["&&", "a", ["||", "b", "c"]]
    );

    expect(subject.parse("1 > 2 && 3 <= 4 / (1 + 2)")).toEqual(
      ["&&", [">", 1, 2], ["<=", 3, ["/", 4, ["+", 1, 2]]]]
    );

    expect(subject.parse("(a < b) || (b < c)")).toEqual(
      ["||", ["<", "a", "b"], ["<", "b", "c"]]
    );

    expect(subject.parse("a * (b.abs + c.get(1.abs))")).toEqual(
      ["*", "a", ["+", ["abs", "b"], ["get", "c", ["abs", 1]]]]
    );

    expect(subject.parse("arr.empty? || true")).toEqual(
      ["||", ["empty?", "arr"], true]
    );

    expect(subject.parse("[1, 2].get(0)")).toEqual(
      ["get", ["collect", 1, 2], 0]
    );

    expect(subject.parse("[[1].get(0) + 1]")).toEqual(
      ["collect", ["+", ["get", ["collect", 1], 0], 1]]
    );

    expect(subject.parse("-arr[0]")).toEqual(["-@", ["[]", "arr", 0]]);

    expect(subject.parse("-[1, 2, x][-y] * 3")).toEqual(
      ["*", ["-@", ["[]", ["collect", 1, 2, "x"], ["-@", "y"]]], 3]
    );

    expect(subject.parse("x == 1 ? 1 + 1 : 2 + 2")).toEqual(
      ["if", ["==", "x", 1], ["+", 1, 1], ["+", 2, 2]]
    );

    expect(subject.parse("a.abs")).toEqual(["abs", "a"]);
    expect(subject.parse("a.b(1 + 1)")).toEqual(["b", "a", ["+", 1, 1]]);
    expect(subject.parse("a || b && c")).toEqual(
      ["||", "a", ["&&", "b", "c"]]
    );
    expect(subject.parse("a && b == c")).toEqual(
      ["&&", "a", ["==", "b", "c"]]
    );
    expect(subject.parse("a == b < c")).toEqual(
      ["==", "a", ["<", "b", "c"]]
    );
    expect(subject.parse("1 < 2")).toEqual(["<", 1, 2]);
    expect(subject.parse("a >= b / c")).toEqual(
      [">=", "a", ["/", "b", "c"]]
    );

    expect(subject.parse("a.b(c)")).toEqual(["b", "a", "c"]);
    expect(subject.parse("-(1)")).toEqual(["-@", 1]);
    expect(subject.parse("-(1, 2)")).toEqual(["-", 1, 2]);
    expect(subject.parse("a.-(b)--c")).toEqual(
      ["-", ["-", "a", "b"], ["-@", "c"]]
    );

    expect(subject.parse("a.==(b)")).toEqual(["==", "a", "b"]);
    expect(subject.parse("1.collect(2)")).toEqual(["collect", 1, 2]);

    expect(subject.parse("1 + 2 / 3")).toEqual(["+", 1, ["/", 2, 3]]);
    expect(subject.parse("-3")).toEqual(["-@", 3]);
    expect(subject.parse("!foo")).toEqual(["!@", "foo"]);
    expect(subject.parse("true")).toEqual(true);
    expect(subject.parse("false")).toEqual(false);
    expect(subject.parse("50")).toEqual(50);
    expect(subject.parse("a")).toEqual("a");
    expect(subject.parse("foo")).toEqual("foo");
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("()"); }).toThrow();
    expect(function () { subject.parse(")("); }).toThrow();
    expect(function () { subject.parse("(1))"); }).toThrow();
    expect(function () { subject.parse("(1 2)"); }).toThrow();
    expect(function () { subject.parse("(1, 2)"); }).toThrow();
  });
});
