"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level4Compiler/instructionSet");
var CodeWriter = require(compiler + "/level4Compiler/codeWriter");
var ExpressionParser = require(compiler + "/level4Compiler/expressionParser");

describe("InstructionSet", function () {
  var subject, codeWriter, expressionParser;

  beforeEach(function () {
    codeWriter = new CodeWriter();
    expressionParser = new ExpressionParser();

    subject = new describedClass({
      codeWriter: codeWriter,
      expressionParser: expressionParser
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
        { type: "constant", value: 1 },
        { type: "pop", symbol: "a" },
        { type: "constant", value: true },
        { type: "pop", symbol: "b" }
      ]);
    });

    it("emits instructions for complex assignments", function () {
      spyOn(codeWriter, "instruction");
      subject.assignment([["a", "b"], [[1, [2], "/"], [true, ["x"], "||"]]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "constant", value: 1 },
        { type: "constant", value: 2 },
        { type: "divide" },
        { type: "pop", symbol: "a" },
        { type: "constant", value: true },
        { type: "push", symbol: "x" },
        { type: "or" },
        { type: "pop", symbol: "b" }
      ]);
    });
  });

  describe("destructuredAssignment", function () {
    it("emits instructions for divmod", function () {
      spyOn(codeWriter, "instruction");
      subject.destructuredAssignment([["div", "mod"], [3, [2], "divmod"]]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "constant", value: 3 },
        { type: "constant", value: 2 },
        { type: "divmod" },
        { type: "pop", symbol: "div" },
        { type: "pop", symbol: "mod" }
      ]);
    });

    it("emits instructions for get", function () {
      spyOn(codeWriter, "instruction");

      subject.destructuredAssignment(
        [["a", "a_present"], ["arr", [3], "get"]]
      );

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "arr" },
        { type: "constant", value: 3 },
        { type: "get" },
        { type: "pop", symbol: "a" },
        { type: "pop", symbol: "a_present" }
      ]);
    });
  });

  describe("invariant", function () {
    it("emits instructions for simple invariants", function () {
      spyOn(codeWriter, "instruction");
      subject.invariant([["a", [2], "=="], true]);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "constant", value: 2 },
        { type: "equal" },
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
});
