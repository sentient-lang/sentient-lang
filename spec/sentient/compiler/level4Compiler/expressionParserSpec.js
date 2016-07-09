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

  it("generates instructions for 'buildArray' function calls", function () {
    expect(describedClass.parse(["buildArray", 1, 2])).toEqual([
      { type: "constant", value: 1 },
      { type: "constant", value: 2 },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse(["buildArray", "a", true])).toEqual([
      { type: "push", symbol: "a" },
      { type: "constant", value: true },
      { type: "collect", width: 2 }
    ]);

    expect(describedClass.parse(["buildArray", 1])).toEqual([
      { type: "constant", value: 1 },
      { type: "collect", width: 1 }
    ]);
  });

  describe("upto", function () {
    it("generates a function call per constant", function () {
      expect(describedClass.parse(["upto", 2, 4, "*foo"])).toEqual([
        { type: "constant", value: 2 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 3 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 4 },
        { type: "call", name: "foo", width: 1 }
      ]);

      expect(describedClass.parse(["upto", -1, 1, "*foo"])).toEqual([
        { type: "constant", value: -1 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 0 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 1 },
        { type: "call", name: "foo", width: 1 }
      ]);

      expect(describedClass.parse(["upto", 3, 3, "*foo"])).toEqual([
        { type: "constant", value: 3 },
        { type: "call", name: "foo", width: 1 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["upto"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["upto", 1]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["upto", 1, 2]);
      }).toThrow();
    });

    it("throws an error if 'start' is greater than 'stop'", function () {
      expect(function () {
        describedClass.parse(["upto", 4, 2, "*foo"]);
      }).toThrow();
    });
  });

  describe("downto", function () {
    it("generates a function call per constant", function () {
      expect(describedClass.parse(["downto", 4, 2, "*foo"])).toEqual([
        { type: "constant", value: 4 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 3 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 2 },
        { type: "call", name: "foo", width: 1 }
      ]);

      expect(describedClass.parse(["downto", 1, -1, "*foo"])).toEqual([
        { type: "constant", value: 1 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 0 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: -1 },
        { type: "call", name: "foo", width: 1 }
      ]);

      expect(describedClass.parse(["downto", 3, 3, "*foo"])).toEqual([
        { type: "constant", value: 3 },
        { type: "call", name: "foo", width: 1 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["downto"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["downto", 1]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["downto", 2, 1]);
      }).toThrow();
    });

    it("throws an error if 'start' is less than 'stop'", function () {
      expect(function () {
        describedClass.parse(["downto", 2, 4, "*foo"]);
      }).toThrow();
    });
  });

  describe("times", function () {
    it("generates a function call per constant", function () {
      expect(describedClass.parse(["times", 3, "*foo"])).toEqual([
        { type: "constant", value: 0 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 1 },
        { type: "call", name: "foo", width: 1 },
        { type: "constant", value: 2 },
        { type: "call", name: "foo", width: 1 }
      ]);

      expect(describedClass.parse(["times", 1, "*foo"])).toEqual([
        { type: "constant", value: 0 },
        { type: "call", name: "foo", width: 1 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["times"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["times", 1]);
      }).toThrow();
    });

    it("throws an error if not a positive integer", function () {
      expect(function () {
        describedClass.parse(["times", 0, "foo"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["times", -1, "foo"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["times", -2, "foo"]);
      }).toThrow();
    });
  });

  describe("get", function () {
    it("directly calls getIndex if the index is a known constant", function () {
      expect(describedClass.parse(["get", "array", 3])).toEqual([
        { type: "push", symbol: "array" },
        { type: "getIndex", index: 3, checkBounds: true }
      ]);

      expect(describedClass.parse(["get", "array", ["-@", 3]])).toEqual([
        { type: "push", symbol: "array" },
        { type: "getIndex", index: -3, checkBounds: true }
      ]);
    });

    it("calls get if the index is not a constant", function () {
      expect(describedClass.parse(["get", "array", "x"])).toEqual([
        { type: "push", symbol: "array" },
        { type: "push", symbol: "x" },
        { type: "call", name: "get", width: 2 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["get"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["get", "array"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["get", "array", 1, "x"]);
      }).toThrow();
    });
  });

  describe("fetch", function () {
    it("directly calls fetchIndex if the index is known", function () {
      expect(describedClass.parse(["[]", "array", 3])).toEqual([
        { type: "push", symbol: "array" },
        { type: "fetchIndex", index: 3 }
      ]);

      expect(describedClass.parse(["[]", "array", ["-@", 3]])).toEqual([
        { type: "push", symbol: "array" },
        { type: "fetchIndex", index: -3 }
      ]);
    });

    it("calls fetch if the index is not a constant", function () {
      expect(describedClass.parse(["[]", "array", "x"])).toEqual([
        { type: "push", symbol: "array" },
        { type: "push", symbol: "x" },
        { type: "call", name: "[]", width: 2 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["[]"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["[]", "array"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["[]", "array", 1, "x"]);
      }).toThrow();
    });
  });

  describe("eachCons", function () {
    it("calls eachCons with the integer literal", function () {
      expect(describedClass.parse(["eachCons", "array", 2, "*foo"])).toEqual([
        { type: "push", symbol: "array" },
        { type: "pointer", name: "foo" },
        { type: "eachCons", width: 2 }
      ]);
    });

    it("throws an error if wrong number of args", function () {
      expect(function () {
        describedClass.parse(["eachCons"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["eachCons", "array"]);
      }).toThrow();

      expect(function () {
        describedClass.parse(["eachCons", "array", 2]);
      }).toThrow();
    });

    it("throws an error if not an integer literal", function () {
      expect(function () {
        describedClass.parse(["eachCons", "array", "x", "*foo"]);
      }).toThrow();
    });

    it("throws an error if not a function pointer", function () {
      expect(function () {
        describedClass.parse(["eachCons", "array", 2, "foo"]);
      }).toThrow();
    });
  });
});
