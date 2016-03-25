"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level4Compiler/instructionSet");
var CodeWriter = require(compiler + "/level4Compiler/codeWriter");

describe("InstructionSet", function () {
  var subject, codeWriter;

  beforeEach(function () {
    codeWriter = new CodeWriter();

    subject = new describedClass({
      codeWriter: codeWriter
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
});
