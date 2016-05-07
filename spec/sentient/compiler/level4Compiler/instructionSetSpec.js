"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level4Compiler/instructionSet");
var CodeWriter = require(compiler + "/level4Compiler/codeWriter");
var Registry = require(compiler + "/level4Compiler/registry");
var ExpressionParser = require(compiler + "/level4Compiler/expressionParser");

describe("InstructionSet", function () {
  var subject, codeWriter, expressionParser, registry;

  beforeEach(function () {
    codeWriter = new CodeWriter();
    expressionParser = new ExpressionParser();
    registry = new Registry();

    subject = new describedClass({
      codeWriter: codeWriter,
      expressionParser: expressionParser,
      registry: registry
    });
  });

  describe("call", function () {
    it("calls the method that handles the given instruction", function () {
      spyOn(subject, "declaration");
      subject.call({ type: "declaration", value: "foo" });
      expect(subject.declaration).toHaveBeenCalledWith("foo");

      spyOn(subject, "assignment");
      subject.call({ type: "assignment", value: "foo" });
      expect(subject.assignment).toHaveBeenCalledWith("foo");
    });

    it("throws an error on an unrecognised instruction", function () {
      expect(function () {
        subject.call({ type: "unrecognised" });
      }).toThrow();
    });
  });

  describe("declaration", function () {
    it("emits instructions for booleans", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["bool"], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "boolean", symbol: "a" },
        { type: "boolean", symbol: "b" },
        { type: "boolean", symbol: "c" }
      ]);
    });

    it("emits instructions for integers", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["int", 6], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "integer", symbol: "c", width: 6 }
      ]);
    });

    it("defaults integers to 8 bits", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["int"], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "integer", symbol: "a", width: 8 },
        { type: "integer", symbol: "b", width: 8 },
        { type: "integer", symbol: "c", width: 8 }
      ]);
    });

    it("emits instructions for boolean arrays", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["array", 3, "bool"], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "typedef", name: "boolean" },
        { type: "array", symbol: "a", width: 3 },
        { type: "typedef", name: "boolean" },
        { type: "array", symbol: "b", width: 3 },
        { type: "typedef", name: "boolean" },
        { type: "array", symbol: "c", width: 3 }
      ]);
    });

    it("emits instructions for integer arrays", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["array", 3, "int", 6], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "a", width: 3 },
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "b", width: 3 },
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "c", width: 3 }
      ]);
    });

    it("defaults integer elements to 8 bits", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["array", 3, "int"], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "typedef", name: "integer", width: 8 },
        { type: "array", symbol: "a", width: 3 },
        { type: "typedef", name: "integer", width: 8 },
        { type: "array", symbol: "b", width: 3 },
        { type: "typedef", name: "integer", width: 8 },
        { type: "array", symbol: "c", width: 3 }
      ]);
    });

    it("emits instructions for nested arrays", function () {
      spyOn(codeWriter, "instruction");
      subject.declaration([["array", 3, "array", 4, "int"], ["a", "b", "c"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 4 },
        { type: "array", symbol: "a", width: 3 },
        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 4 },
        { type: "array", symbol: "b", width: 3 },
        { type: "typedef", name: "integer", width: 8 },
        { type: "typedef", name: "array", width: 4 },
        { type: "array", symbol: "c", width: 3 }
      ]);
    });
  });

  describe("assignment", function () {
    it("emits instructions for simple assignments", function () {
      spyOn(codeWriter, "instruction");
      subject.assignment([["a", "b"], [1, true]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "constant", value: true },
        { type: "constant", value: 1 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "$$$_L4_TMP2_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "a" },
        { type: "push", symbol: "$$$_L4_TMP2_$$$" },
        { type: "pop", symbol: "b" }
      ]);
    });

    it("emits instructions for complex assignments", function () {
      spyOn(codeWriter, "instruction");
      subject.assignment([["a", "b"], [["/", 1, 2], ["||", true, "x"]]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "constant", value: true },
        { type: "push", symbol: "x" },
        { type: "call", name: "||", width: 2 },
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "call", name: "/", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "$$$_L4_TMP2_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "a" },
        { type: "push", symbol: "$$$_L4_TMP2_$$$" },
        { type: "pop", symbol: "b" }
      ]);
    });

    it("emits instructions for divmod", function () {
      spyOn(codeWriter, "instruction");
      subject.assignment([["div", "mod"], [["divmod", 3, 2]]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "constant", value: 3 },
        { type: "constant", value: 2 },
        { type: "call", name: "divmod", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "$$$_L4_TMP2_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "div" },
        { type: "push", symbol: "$$$_L4_TMP2_$$$" },
        { type: "pop", symbol: "mod" }
      ]);
    });

    it("emits instructions for get", function () {
      spyOn(codeWriter, "instruction");

      subject.assignment(
        [["a", "a_present"], [["get", "arr", 3]]]
      );

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "arr" },
        { type: "constant", value: 3 },
        { type: "call", name: "get", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "$$$_L4_TMP2_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "a" },
        { type: "push", symbol: "$$$_L4_TMP2_$$$" },
        { type: "pop", symbol: "a_present" }
      ]);
    });
  });

  describe("invariant", function () {
    it("emits instructions for simple invariants", function () {
      spyOn(codeWriter, "instruction");
      subject.invariant([["==", "a", 2], true]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "constant", value: 2 },
        { type: "call", name: "==", width: 2 },
        { type: "invariant" },
        { type: "constant", value: true },
        { type: "invariant" }
      ]);
    });
  });

  describe("vary", function () {
    it("emits instructions", function () {
      spyOn(codeWriter, "instruction");
      subject.vary(["a", "b", "c"]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]);
    });
  });

  describe("function", function () {
    it("emits instructions for function definitions", function () {
      spyOn(codeWriter, "instruction");

      subject._function({
        name: "add",
        dynamic: false,
        args: ["a", "b"],
        body: [],
        ret: [1, ["+", "a", "b"]]
      });

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "add", dynamic: false, args: ["a", "b"] },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "call", name: "+", width: 2 },
        { type: "return", width: 1 }
      ]);
    });

    it("emits instructions for dynamically scoped functions", function () {
      spyOn(codeWriter, "instruction");

      subject._function({
        name: "double_x",
        dynamic: true,
        args: [],
        body: [{ type: "assignment", value: [["x"], [["*", "x", 2]]] }],
        ret: [0]
      });

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "double_x", dynamic: true, args: [] },
        { type: "push", symbol: "x" },
        { type: "constant", value: 2 },
        { type: "call", name: "*", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "x" },
        { type: "return", width: 0 }
      ]);
    });

    it("emits instructions for nested function definitions", function () {
      spyOn(codeWriter, "instruction");

      subject._function({
        name: "x",
        dynamic: false,
        args: [],
        body: [
          {
            type: "function",
            value: {
              name: "y",
              dynamic: false,
              args: [],
              body: [],
              ret: [0]
            }
          }
        ],
        ret: [0]
      });

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "x", dynamic: false, args: [] },
        { type: "define", name: "y", dynamic: false, args: [] },
        { type: "return", width: 0 },
        { type: "return", width: 0 }
      ]);
    });

    it("emits instructions for anonymous functions", function () {
      spyOn(codeWriter, "instruction");

      subject._function({
        name: "_anonymous",
        dynamic: false,
        args: [],
        body: [],
        ret: [1, 123]
      });

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "_anonymous1", dynamic: false, args: [] },
        { type: "constant", value: 123 },
        { type: "return", width: 1 }
      ]);
    });

    it("returns the name of the defined function", function () {
      var result = subject._function({
        name: "_anonymous",
        dynamic: false,
        args: [],
        body: [],
        ret: [1, 123]
      });

      expect(result).toEqual("_anonymous1");

      result = subject._function({
        name: "foo",
        dynamic: false,
        args: [],
        body: [],
        ret: [1, 123]
      });

      expect(result).toEqual("foo");

      result = subject._function({
        name: "_anonymous",
        dynamic: false,
        args: [],
        body: [],
        ret: [1, 123]
      });

      expect(result).toEqual("_anonymous2");
    });
  });

  describe("functionExpression", function () {
    it("emits instructions", function () {
      spyOn(codeWriter, "instruction");

      subject.functionExpression(["increment!"]);
      subject.functionExpression(["multiply_x_by", "y"]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "call", name: "increment!", width: 0 },
        { type: "push", symbol: "y" },
        { type: "call", name: "multiply_x_by", width: 1 }
      ]);
    });
  });

  describe("inlining function arguments", function () {
    it("automatically defines functions in functionExpression", function () {
      spyOn(codeWriter, "instruction");

      subject.functionExpression(["foo", "a", "*b", {
        name: "_anonymous",
        dynamic: true,
        args: ["c"],
        body: [
          { type: "assignment", value: [["x"], [["+", "x", "c"]]] }
        ],
        ret: [0]
      }, "d"]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "_anonymous1", dynamic: true, args: ["c"] },
        { type: "push", symbol: "x" },
        { type: "push", symbol: "c" },
        { type: "call", name: "+", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "x" },
        { type: "return", width: 0 },

        { type: "push", symbol: "a" },
        { type: "pointer", name: "*b" },
        { type: "pointer", name: "*_anonymous1" },
        { type: "push", symbol: "d" },
        { type: "call", name: "foo", width: 4 }
      ]);
    });

    it("automatically defines functions in assignment", function () {
      spyOn(codeWriter, "instruction");

      subject.assignment([["a"], [["foo", {
        name: "_anonymous",
        dynamic: false,
        args: [],
        body: [],
        ret: [1, 123]
      }]]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "define", name: "_anonymous1", dynamic: false, args: [] },
        { type: "constant", value: 123 },
        { type: "return", width: 1 },

        { type: "pointer", name: "*_anonymous1" },
        { type: "call", name: "foo", width: 1 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "a" }
      ]);
    });
  });
});
