"use strict";

var SpecHelper = require("../../../../specHelper");
var subject = SpecHelper.parserForRule("function");

describe("function", function () {
  it("accepts valid", function () {
    expect(subject.parse("function noop () {}")).toEqual({
      name: "noop",
      dynamic: false,
      immutable: false,
      args: [],
      body: [],
      ret: [0]
    });

    expect(subject.parse("function add (a, b) { return a + b; }")).toEqual({
      name: "add",
      dynamic: false,
      immutable: false,
      args: ["a", "b"],
      body: [],
      ret: [1, ["+", "a", "b"]]
    });

    expect(subject.parse("function double(x){return x*2;}")).toEqual({
      name: "double",
      dynamic: false,
      immutable: false,
      args: ["x"],
      body: [],
      ret: [1, ["*", "x", 2]]
    });

    expect(subject.parse("function zero? (x) { return x == 0; }")).toEqual({
      name: "zero?",
      dynamic: false,
      immutable: false,
      args: ["x"],
      body: [],
      ret: [1, ["==", "x", 0]]
    });

    expect(
      subject.parse("function foo () { a = 1; b = 2; return3 a, b, 3; }")
    ).toEqual({
      name: "foo",
      dynamic: false,
      immutable: false,
      args: [],
      body: [
        { type: "assignment", value: [["a"], [1]] },
        { type: "assignment", value: [["b"], [2]] }
      ],
      ret: [3, "a", "b", 3]
    });

    expect(subject.parse("function^ double_x () { x *= 2; }")).toEqual({
      name: "double_x",
      dynamic: true,
      immutable: false,
      args: [],
      body: [{ type: "assignment", value: [["x"], [["*", "x", 2]]] }],
      ret: [0]
    });

    expect(
      subject.parse("function x () { function y () {}; }")
    ).toEqual({
      name: "x",
      dynamic: false,
      immutable: false,
      args: [],
      body: [
        {
          type: "function",
          value: {
            name: "y",
            dynamic: false,
            immutable: false,
            args: [],
            body: [],
            ret: [0]
          }
        }
      ],
      ret: [0]
    });

    expect(
      subject.parse("function x (*y, z) { return y(z); }")
    ).toEqual({
      name: "x",
      dynamic: false,
      immutable: false,
      args: ["*y", "z"],
      body: [],
      ret: [1, ["y", "z"]]
    });

    expect(
      subject.parse("function () { return 123; }")
    ).toEqual({
      name: "_anonymous",
      dynamic: false,
      immutable: false,
      args: [],
      body: [],
      ret: [1, 123]
    });

    expect(
      subject.parse("function foo& () { return 123; }")
    ).toEqual({
      name: "foo",
      dynamic: false,
      immutable: true,
      args: [],
      body: [],
      ret: [1, 123]
    });

    expect(
      subject.parse("function^ foo& () { return 123; }")
    ).toEqual({
      name: "foo",
      dynamic: true,
      immutable: true,
      args: [],
      body: [],
      ret: [1, 123]
    });

    expect(
      subject.parse("function^ &&& () { return 123; }")
    ).toEqual({
      name: "&&",
      dynamic: true,
      immutable: true,
      args: [],
      body: [],
      ret: [1, 123]
    });
  });

  it("rejects invalid", function () {
    expect(function () { subject.parse(""); }).toThrow();
    expect(function () { subject.parse("functionfoo () {}"); }).toThrow();
    expect(function () { subject.parse("function foo () {};"); }).toThrow();
    expect(function () { subject.parse("function ^ foo () {}"); }).toThrow();
  });
});
