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

    expect(describedClass.parse(["collect", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse(["collect", "a", true])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: true },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse(["collect", 1])).toEqual([
      { type: "constant", value: 1 },
      { type: "collect", width: 1 }
    ]);
  });

  it("generates instructions for fetch expressions", function () {
    expect(describedClass.parse(["[]", "arr", 0])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 0 },
      { type: "call", name: "[]", width: 2 }
    ]);

    expect(describedClass.parse(["[]", "arr", "a"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "push", symbol: "a" },
      { type: "call", name: "[]", width: 2 }
    ]);

    expect(describedClass.parse(["[]", "arr", 1])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 1 },
      { type: "call", name: "[]", width: 2 }
    ]);

    expect(describedClass.parse(["[]", "arr", ["-@", 1]])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 1 },
      { type: "call", name: "-@", width: 1 },
      { type: "call", name: "[]", width: 2 }
    ]);

    expect(describedClass.parse(["[]", "x", ["+", 1, 2]])).toEqual([
      { type: "push", symbol: "x" },
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "+", width: 2 },
      { type: "call", name: "[]", width: 2 }
    ]);

    expect(describedClass.parse(
      ["[]", ["[]", "arr", 0], ["*", 1, 2]]
    )).toEqual([
      { type: "push", symbol: "arr" },
      { type: "constant", value: 0 },
      { type: "call", name: "[]", width: 2 },
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "*", width: 2 },
      { type: "call", name: "[]", width: 2 },
    ]);
  });

  it("generates instructions for unary expressions", function () {
    expect(describedClass.parse(["-@", 0])).toEqual([
      { type: "constant", value: 0 },
      { type: "call", name: "-@", width: 1 }
    ]);

    expect(describedClass.parse(["-@", 123])).toEqual([
      { type: "constant", value: 123 },
      { type: "call", name: "-@", width: 1 }
    ]);

    expect(describedClass.parse(["-@", "foo"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "call", name: "-@", width: 1 }
    ]);

    expect(describedClass.parse(["!@", true])).toEqual([
      { type: "constant", value: true },
      { type: "call", name: "!@", width: 1 }
    ]);

    expect(describedClass.parse(["!@", false])).toEqual([
      { type: "constant", value: false },
      { type: "call", name: "!@", width: 1 }
    ]);

    expect(describedClass.parse(["!@", "foo"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "call", name: "!@", width: 1 }
    ]);
  });

  it("generates instructions for method expressions", function () {
    expect(describedClass.parse(["abs", "a"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "call", name: "abs", width: 1 }
    ]);

    expect(describedClass.parse(["abs", ["-@", 123]])).toEqual([
      { type: "constant", value: 123 },
      { type: "call", name: "-@", width: 1 },
      { type: "call", name: "abs", width: 1 }
    ]);

    expect(describedClass.parse(["length", "arr"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "call", name: "length", width: 1 }
    ]);

    expect(describedClass.parse(["-@", ["abs", 123]])).toEqual([
      { type: "constant", value: 123 },
      { type: "call", name: "abs", width: 1 },
      { type: "call", name: "-@", width: 1 }
    ]);

    expect(describedClass.parse(["if", "c", true, false])).toEqual([
      { type: "push", symbol: "c" },
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "call", name: "if", width: 3 }
    ]);
  });

  it("generates instructions for multiplicative expressions", function () {
    expect(describedClass.parse(["*", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "*", width: 2 }
    ]);

    expect(describedClass.parse(["/", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "/", width: 2 }
    ]);

    expect(describedClass.parse(["%", 123, "b"])).toEqual([
      { type: "constant", value: 123 },
      { type: "push", symbol: "b" },
      { type: "call", name: "%", width: 2 }
    ]);

    expect(describedClass.parse(["*", "a", ["-@", "b"]])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "-@", width: 1 },
      { type: "call", name: "*", width: 2 }
    ]);

    expect(describedClass.parse(["*", ["*", "a", 5], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 5 },
      { type: "call", name: "*", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "*", width: 2 }
    ]);

    expect(describedClass.parse(
      ["%", ["/", ["*", "a", "b"], "c"], "d"]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "*", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "/", width: 2 },
      { type: "push", symbol: "d" },
      { type: "call", name: "%", width: 2 }
    ]);

    expect(describedClass.parse(["*", ["abs", ["-@", 3]], "a"])).toEqual([
      { type: "constant", value: 3 },
      { type: "call", name: "-@", width: 1 },
      { type: "call", name: "abs", width: 1 },
      { type: "push", symbol: "a" },
      { type: "call", name: "*", width: 2 }
    ]);
  });

  it("generates instructions for additive expressions", function () {
    expect(describedClass.parse(["+", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "+", width: 2 }
    ]);

    expect(describedClass.parse(["-", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "-", width: 2 }
    ]);

    expect(describedClass.parse(["+", "a", ["/", "b", "c"]])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "call", name: "/", width: 2 },
      { type: "call", name: "+", width: 2 }
    ]);

    expect(describedClass.parse(["+", ["-", "a", "b"], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "-", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "+", width: 2 }
    ]);

    expect(describedClass.parse(
      ["-", ["-", "a", ["-@", "b"]], "c"]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "-@", width: 1 },
      { type: "call", name: "-", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "-", width: 2 }
    ]);
  });

  it("generates instructions for comparative expressions", function () {
    expect(describedClass.parse(["<", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "<", width: 2 }
    ]);

    expect(describedClass.parse([">", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: ">", width: 2 }
    ]);

    expect(describedClass.parse(["<=", 1, "b"])).toEqual([
      { type: "constant", value: 1 },
      { type: "push", symbol: "b" },
      { type: "call", name: "<=", width: 2 }
    ]);

    expect(describedClass.parse([">=", "a", 2])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 2 },
      { type: "call", name: ">=", width: 2 }
    ]);

    expect(describedClass.parse(
      ["<", "a", ["+", ["-@", 1], ["/", "b", "c"]]]
    )).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: 1 },
      { type: "call", name: "-@", width: 1 },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "call", name: "/", width: 2 },
      { type: "call", name: "+", width: 2 },
      { type: "call", name: "<", width: 2 }
    ]);
  });

  it("generates instructions for equality expressions", function () {
    expect(describedClass.parse(["==", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "==", width: 2 }
    ]);

    expect(describedClass.parse(["!=", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "!=", width: 2 }
    ]);

    expect(describedClass.parse(["==", ["<", "a", "b"], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "<", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "==", width: 2 }
    ]);

    expect(describedClass.parse(["==", ["!=", 1, 2], 3])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "call", name: "!=", width: 2 },
      { type: "constant", value: 3 },
      { type: "call", name: "==", width: 2 }
    ]);

    expect(describedClass.parse(["!=", ["!@", true], ["!@", false]])).toEqual([
      { type: "constant", value: true },
      { type: "call", name: "!@", width: 1 },
      { type: "constant", value: false },
      { type: "call", name: "!@", width: 1 },
      { type: "call", name: "!=", width: 2 }
    ]);
  });

  it("generates instructions for conjunctive expressions", function () {
    expect(describedClass.parse(["&&", true, false])).toEqual([
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "call", name: "&&", width: 2 }
    ]);

    expect(describedClass.parse(["&&", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "&&", width: 2 }
    ]);

    expect(describedClass.parse(["&&", "a", ["==", "b", "c"]])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "call", name: "==", width: 2 },
      { type: "call", name: "&&", width: 2 }
    ]);

    expect(describedClass.parse(["&&", ["&&", "a", "b"], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "&&", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "&&", width: 2 }
    ]);
  });

  it("generates instructions for disjunctive expressions", function () {
    expect(describedClass.parse(["||", true, false])).toEqual([
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "call", name: "||", width: 2 }
    ]);

    expect(describedClass.parse(["||", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "||", width: 2 }
    ]);

    expect(describedClass.parse(["||", "a", ["&&", "b", "c"]])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "push", symbol: "c" },
      { type: "call", name: "&&", width: 2 },
      { type: "call", name: "||", width: 2 }
    ]);

    expect(describedClass.parse(["||", ["||", "a", "b"], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "||", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "||", width: 2 }
    ]);
  });
});
