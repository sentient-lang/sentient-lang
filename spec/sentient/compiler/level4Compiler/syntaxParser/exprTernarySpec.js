"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("exprTernary", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["exprTernary"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("a ? b : c")).toEqual(["a", ["b", "c"], "if"]);
    expect(subject.parse("true ? 1 : 2")).toEqual([true, [1, 2], "if"]);

    expect(subject.parse("a || b ? !c : d")).toEqual(
      [["a", ["b"], "||"], [["c", "!"], "d"], "if"]
    );

    expect(subject.parse("a ? b : c ? d : e")).toEqual(
      ["a", ["b", ["c", ["d", "e"], "if"]], "if"]
    );

    expect(subject.parse("(a ? b : c) ? d : e")).toEqual(
      [["a", ["b", "c"], "if"], ["d", "e"], "if"]
    );

    expect(subject.parse("a ? b ? c : d : e ? f : g ? h : i")).toEqual(
      ["a",
        [["b", ["c", "d"], "if"],
        ["e", ["f", ["g", ["h", "i"], "if"]], "if"]], "if"
      ]
    );

    expect(subject.parse("a?b:c?d:e")).toEqual(
      ["a", ["b", ["c", ["d", "e"], "if"]], "if"]
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
