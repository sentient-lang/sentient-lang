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

    expect(describedClass.parse([[1, 2], "collect"])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse([["a", true], "collect"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: true },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse([[1], "collect"])).toEqual([
      { type: "constant", value: 1 },
      { type: "collect", width: 1 }
    ]);
  });
});
