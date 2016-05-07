"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("callList");

describe("callList", function () {
  it("accepts valid", function () {
    expect(subject.parse("a")).toEqual(["a"]);
    expect(subject.parse("a,b")).toEqual(["a", "b"]);
    expect(subject.parse("123")).toEqual([123]);
    expect(subject.parse("2 + 2")).toEqual([["+", 2, 2]]);
    expect(subject.parse("*empty?")).toEqual(["*empty?"]);
    expect(subject.parse("*find!")).toEqual(["*find!"]);
    expect(subject.parse("*+")).toEqual(["*+"]);
    expect(subject.parse("*+, *foo")).toEqual(["*+", "*foo"]);
    expect(subject.parse("**")).toEqual(["**"]);
    expect(subject.parse("*&&")).toEqual(["*&&"]);
    expect(subject.parse("*foo, 123, *&&")).toEqual(["*foo", 123, "*&&"]);

    expect(subject.parse("function () { return 123; }")).toEqual([{
      name: "_anonymous",
      dynamic: false,
      args: [],
      body: [],
      ret: [1, 123]
    }]);

    expect(subject.parse("a, *b, function^ (c) { x += c; }, d")).toEqual([
      "a", "*b", {
        name: "_anonymous",
        dynamic: true,
        args: ["c"],
        body: [
          { type: "assignment", value: [["x"], [["+", "x", "c"]]] }
        ],
        ret: [0]
      }, "d"
    ]);
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
  });
});
