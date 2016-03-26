"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("exprFetch", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["exprFetch"]
    });
  });

  it("accepts valid", function () {
    expect(subject.parse("arr[0]")).toEqual(["arr", [0], "[]"]);
    expect(subject.parse("arr[a]")).toEqual(["arr", ["a"], "[]"]);
    expect(subject.parse("arr[ 1 ]")).toEqual(["arr", [1], "[]"]);
    expect(subject.parse("arr[-1]")).toEqual(["arr", [[1, "-"]], "[]"]);
    expect(subject.parse("x[1 + 2]")).toEqual(["x", [[1, 2, "+"]], "[]"]);

    expect(subject.parse("arr[0][1 * 2]")).toEqual(
      [["arr", [0], "[]"], [[1, 2, "*"]], "[]"]
    );
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("arr[]"); }).toThrow();
    expect(function () { subject.parse("arr[1, 2]"); }).toThrow();
  });
});
