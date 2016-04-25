"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("exprTernary");

describe("exprTernary", function () {
  it("accepts valid", function () {
    expect(subject.parse("a ? b : c")).toEqual(["if", "a", "b", "c"]);
    expect(subject.parse("true ? 1 : 2")).toEqual(["if", true, 1, 2]);

    expect(subject.parse("a || b ? !c : d")).toEqual(
      ["if", ["||", "a", "b"], ["!@", "c"], "d"]
    );

    expect(subject.parse("a ? b : c ? d : e")).toEqual(
      ["if", "a", "b", ["if", "c", "d", "e"]]
    );

    expect(subject.parse("(a ? b : c) ? d : e")).toEqual(
      ["if", ["if", "a", "b", "c"], "d", "e"]
    );

    expect(subject.parse("a ? b ? c : d : e ? f : g ? h : i")).toEqual(
      ["if", "a",
        ["if", "b", "c", "d"],
        ["if", "e", "f",
          ["if", "g", "h", "i"]
        ]
      ]
    );

    expect(subject.parse("a?b:c?d:e")).toEqual(
      ["if", "a", "b", ["if", "c", "d", "e"]]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("a ? b"); }).toThrow();
    expect(function () { subject.parse("a ? b : c : d"); }).toThrow();
    expect(function () { subject.parse("a ? b ? c"); }).toThrow();
    expect(function () { subject.parse("a ? b, c"); }).toThrow();
  });
});
