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

    expect(describedClass.parse("*foo")).toEqual([
      { type: "pointer", name: "*foo" }
    ]);
  });

  it("inlines negations/nots of constants", function () {
    expect(describedClass.parse(["-@", 123])).toEqual([
      { type: "constant", value: -123 }
    ]);

    expect(describedClass.parse(["!@", true])).toEqual([
      { type: "constant", value: false }
    ]);

    expect(describedClass.parse(["!@", false])).toEqual([
      { type: "constant", value: true }
    ]);

    expect(describedClass.parse(["-@", "foo"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "call", name: "-@", width: 1 }
    ]);

    expect(describedClass.parse(["!@", "foo"])).toEqual([
      { type: "push", symbol: "foo" },
      { type: "call", name: "!@", width: 1 }
    ]);
  });

  it("generates instructions for arbitraty function calls", function () {
    expect(describedClass.parse(["length", "arr"])).toEqual([
      { type: "push", symbol: "arr" },
      { type: "call", name: "length", width: 1 }
    ]);

    expect(describedClass.parse(["abs", "a"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "call", name: "abs", width: 1 }
    ]);

    expect(describedClass.parse(["if", "c", true, false])).toEqual([
      { type: "push", symbol: "c" },
      { type: "constant", value: true },
      { type: "constant", value: false },
      { type: "call", name: "if", width: 3 }
    ]);

    expect(describedClass.parse(["/", "a", "b"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "/", width: 2 }
    ]);

    expect(describedClass.parse(["+", ["-", "a", "b"], "c"])).toEqual([
      { type: "push", symbol: "a" },
      { type: "push", symbol: "b" },
      { type: "call", name: "-", width: 2 },
      { type: "push", symbol: "c" },
      { type: "call", name: "+", width: 2 }
    ]);
  });

  it("generates instructions for 'collect' function calls", function () {
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
});
