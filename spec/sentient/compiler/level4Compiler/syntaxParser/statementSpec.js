"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("statement", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser({
      allowedStartRules: ["statement"]
    });
  });

  it("parses declarations", function () {
    expect(subject.parse("int6 a")).toEqual(
      { type: "declaration", value: [["int", 6], ["a"]] }
    );

    expect(subject.parse("array3<int4> a, b")).toEqual(
      { type: "declaration", value: [["array", 3, "int", 4], ["a", "b"]] }
    );
  });

  it("parses assignments", function () {
    expect(subject.parse("a = 1")).toEqual(
      { type: "assignment", value: [["a"], [1]] }
    );

    expect(subject.parse("a, b = (1 + 2) / 3, true")).toEqual({
      type: "assignment",
      value: [["a", "b"], [[[1, [2], "+"], [3], "/"], true]]
    });
  });

  it("parses composite assignments", function () {
    expect(subject.parse("a += 1")).toEqual(
      { type: "assignment", value: [["a"], [["a", [1], "+"]]] }
    );

    expect(subject.parse("a %= (1 + 2) / a")).toEqual({
      type: "assignment",
      value: [["a"], [["a", [[[1, [2], "+"], ["a"], "/"]], "%"]]]
    });
  });

  it("parses vary statements", function () {
    expect(subject.parse("vary a")).toEqual(
      { type: "vary", value: ["a"] }
    );

    expect(subject.parse("vary x0, x1, foo_bar")).toEqual(
      { type: "vary", value: ["x0", "x1", "foo_bar"] }
    );
  });

  it("parses invariant statements", function () {
    expect(subject.parse("invariant true")).toEqual(
      { type: "invariant", value: [true] }
    );

    expect(subject.parse("invariant a && b, b == true")).toEqual(
      { type: "invariant", value: [["a", ["b"], "&&"], ["b", [true], "=="]] }
    );
  });
});
