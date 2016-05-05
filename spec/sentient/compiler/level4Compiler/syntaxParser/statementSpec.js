"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("statement");

describe("statement", function () {
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
      value: [["a", "b"], [["/", ["+", 1, 2], 3], true]]
    });
  });

  it("parses composite assignments", function () {
    expect(subject.parse("a += 1")).toEqual(
      { type: "assignment", value: [["a"], [["+", "a", 1]]] }
    );

    expect(subject.parse("a %= (1 + 2) / a")).toEqual({
      type: "assignment",
      value: [["a"], [["%", "a", ["/", ["+", 1, 2], "a"]]]]
    });
  });

  it("parses destructured assignments", function () {
    expect(subject.parse("div, mod =* 3.divmod(2)")).toEqual({
      type: "destructuredAssignment",
      value: [["div", "mod"], ["divmod", 3, 2]]
    });

    expect(subject.parse("a, a_present =* arr.get(3)")).toEqual({
      type: "destructuredAssignment",
      value: [["a", "a_present"], ["get", "arr", 3]]
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
      { type: "invariant", value: [["&&", "a", "b"], ["==", "b", true]] }
    );
  });

  it("parses functions", function () {
    expect(subject.parse("function add (x, y) { return x + y; }")).toEqual({
      type: "function",
      value: {
        name: "add",
        dynamic: false,
        args: ["x", "y"],
        body: [],
        ret: [1, ["+", "x", "y"]]
      }
    });
  });

  // This is so that we can call dynamically scoped functions with side-effects,
  // without having to assign to a variable.
  it("parses function expressions", function () {
    expect(subject.parse("increment!()")).toEqual(
      { type: "functionExpression", value: ["increment!"] }
    );

    expect(subject.parse("multiply_x_by(y)")).toEqual(
      { type: "functionExpression", value: ["multiply_x_by", "y"] }
    );
  });
});
