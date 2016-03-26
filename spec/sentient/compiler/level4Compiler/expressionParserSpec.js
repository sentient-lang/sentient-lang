"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/expressionParser");

describe("ExpressionParser", function () {
  it("generates instructions for primary expressions", function () {
    expect(describedClass.parse(true)).toEqual([
      { type: "constant", value: true }
    ]);

    expect(describedClass.parse(false)).toEqual([
      { type: "constant", value: false }
    ]);

    expect(describedClass.parse(0)).toEqual([
      { type: "constant", value: 0 }
    ]);

    expect(describedClass.parse(123)).toEqual([
      { type: "constant", value: 123 }
    ]);

    expect(describedClass.parse("foo")).toEqual([
      { type: "push", symbol: "foo" }
    ]);

    expect(describedClass.parse([1, [2], "collect"])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse(["a", [true], "collect"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: true },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse([1, [], "collect"])).toEqual([
      { type: "constant", value: 1 },
      { type: "collect", width: 1 }
    ]);
  });

  it("generates instructions for fetch expressions", function () {
    expect(describedClass.parse(["arr", [0], "[]"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 0 },
      { type: "fetch" }
    ]);

    expect(describedClass.parse(["arr", ["a"], "[]"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "push", symbol: "a" },
      { type: "fetch" }
    ]);

    expect(describedClass.parse(["arr", [1], "[]"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 1 },
      { type: "fetch" }
    ]);

    expect(describedClass.parse(["arr", [[1, "-"]], "[]"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 1 },
      { type: "negate" },
      { type: "fetch" }
    ]);

    expect(describedClass.parse(["x", [[1, 2, "+"]], "[]"])).toEqual([
      { type: "push", symbol: "x" },
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "add" },
      { type: "fetch" }
    ]);

    expect(describedClass.parse(
      [["arr", [0], "[]"], [[1, 2, "*"]], "[]"]
    )).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 0 },
      { type: "fetch" },
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "multiply" },
      { type: "fetch" }
    ]);
  });

  it("generates instructions for unary expressions", function () {
    expect(describedClass.parse([0, "-"])).toEqual([
      { type: "constant", value: 0 },
      { type: "negate" }
    ]);

    expect(describedClass.parse([123, "-"])).toEqual([
      { type: "constant", value: 123 },
      { type: "negate" }
    ]);

    expect(describedClass.parse(["foo", "-"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "negate" }
    ]);

    expect(describedClass.parse([true, "!"])).toEqual([
      { type: "constant", value: true },
      { type: "not" }
    ]);

    expect(describedClass.parse([false, "!"])).toEqual([
      { type: "constant", value: false },
      { type: "not" }
    ]);

    expect(describedClass.parse(["foo", "!"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "not" }
    ]);
  });

  it("generates instructions for method expressions", function () {
    expect(describedClass.parse(["a", [], "abs"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "absolute" }
    ]);

    expect(describedClass.parse([[123, "-"], [], "abs"])).toEqual([
      { type: "constant", value: 123 },
      { type: "negate" },
      { type: "absolute" }
    ]);

    expect(describedClass.parse(["arr", [], "length"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "width" }
    ]);

    expect(describedClass.parse([[123, "-"], [], "abs"])).toEqual([
      { type: "constant", value: 123 },
      { type: "negate" },
      { type: "absolute" }
    ]);

    expect(describedClass.parse(["c", [true, false], "if"])).toEqual([
      { type: "push", symbol: "c" },
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "if" }
    ]);
  });

  it("throws an error if an unknown method is called", function () {
    expect(function () {
      describedClass.parse(["a", [], "unknown_method"]);
    }).toThrow();
  });

  it("generates instructions for multiplicative expressions", function () {
    expect(describedClass.parse([1, [2], "*"])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "multiply" }
    ]);

    expect(describedClass.parse(["a", ["b"], "/"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "divide" }
    ]);

    expect(describedClass.parse([123, ["b"], "%"])).toEqual([
      { type: "constant", value: 123 },
      { type: "push", symbol: "b" },
      { type: "modulo" }
    ]);

    expect(describedClass.parse(["a", [["b", "-"]], "*"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "negate" },
      { type: "multiply" }
    ]);

    expect(describedClass.parse([["a", [5], "*"], ["c"], "*"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 5 },
      { type: "multiply" },
      { type: "push", symbol: "c" },
      { type: "multiply" }
    ]);

    expect(describedClass.parse(
      [[["a", ["b"], "*"], ["c"], "/"], ["d"], "%"]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "multiply" },
      { type: "push", symbol: "c" },
      { type: "divide" },
      { type: "push", symbol: "d" },
      { type: "modulo" }
    ]);

    expect(describedClass.parse([[[3, "-"], [], "abs"], ["a"], "*"])).toEqual([
      { type: "constant", value: 3 },
      { type: "negate" },
      { type: "absolute" },
      { type: "push", symbol: "a" },
      { type: "multiply" }
    ]);
  });

  it("generates instructions for additive expressions", function () {
    expect(describedClass.parse([1, [2], "+"])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "add" }
    ]);

    expect(describedClass.parse(["a", ["b"], "-"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "subtract" }
    ]);

    expect(describedClass.parse(["a", [["b", ["c"], "/"]], "+"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "divide" },
      { type: "add" }
    ]);

    expect(describedClass.parse([["a", ["b"], "-"], ["c"], "+"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "subtract" },
      { type: "push", symbol: "c" },
      { type: "add" }
    ]);

    expect(describedClass.parse(
      [["a", [["b", "-"]], "-"], ["c"], "-"]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "negate" },
      { type: "subtract" },
      { type: "push", symbol: "c" },
      { type: "subtract" }
    ]);
  });

  it("generates instructions for comparative expressions", function () {
    expect(describedClass.parse([1, [2], "<"])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "lessthan" }
    ]);

    expect(describedClass.parse(["a", ["b"], ">"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "greaterthan" }
    ]);

    expect(describedClass.parse([1, ["b"], "<="])).toEqual([
      { type: "constant", value: 1 },
      { type: "push", symbol: "b" },
      { type: "lessequal" }
    ]);

    expect(describedClass.parse(["a", [2], ">="])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 2 },
      { type: "greaterequal" }
    ]);

    expect(describedClass.parse(
      ["a", [[[1, "-"], [["b", ["c"], "/"]], "+"]], "<"]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 1 },
      { type: "negate" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "divide" },
      { type: "add" },
      { type: "lessthan" }
    ]);
  });

  it("generates instructions for equality expressions", function () {
    expect(describedClass.parse([1, [2], "=="])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "equal" }
    ]);

    expect(describedClass.parse(["a", ["b"], "!="])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "equal" },
      { type: "not" }
    ]);

    expect(describedClass.parse([["a", ["b"], "<"], ["c"], "=="])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "lessthan" },
      { type: "push", symbol: "c" },
      { type: "equal" }
    ]);

    expect(describedClass.parse([[1, [2], "=="], [true], "!="])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "equal" },
      { type: "constant", value: true },
      { type: "equal" },
      { type: "not" }
    ]);

    expect(describedClass.parse([[true, "!"], [[false, "!"]], "!="])).toEqual([
      { type: "constant", value: true },
      { type: "not" },
      { type: "constant", value: false },
      { type: "not" },
      { type: "equal" },
      { type: "not" }
    ]);
  });

  it("generates instructions for conjunctive expressions", function () {
    expect(describedClass.parse([true, [false], "&&"])).toEqual([
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "and" }
    ]);

    expect(describedClass.parse(["a", ["b"], "&&"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "and" }
    ]);

    expect(describedClass.parse(["a", [["b", ["c"], "=="]], "&&"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "equal" },
      { type: "and" }
    ]);

    expect(describedClass.parse(["a", [["b", ["c"], "&&"]], "&&"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "and" },
      { type: "and" }
    ]);
  });

  it("generates instructions for disjunctive expressions", function () {
    expect(describedClass.parse([true, [false], "||"])).toEqual([
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "or" }
    ]);

    expect(describedClass.parse(["a", ["b"], "||"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "or" }
    ]);

    expect(describedClass.parse(["a", [["b", ["c"], "&&"]], "||"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "and" },
      { type: "or" }
    ]);

    expect(describedClass.parse(["a", [["b", ["c"], "||"]], "||"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "or" },
      { type: "or" }
    ]);
  });

//  // TODO
//  it("handles methods that return more than one value", function () {
//    expect(describedClass.parse(["arr", ["i"], "get"])).toEqual([
//      { type: "push", symbol: "arr" },
//      { type: "push", symbol: "i" },
//      { type: "get" }
//      // TODO ???
//    ]);
//
//    TODO divmod
//  });
});
