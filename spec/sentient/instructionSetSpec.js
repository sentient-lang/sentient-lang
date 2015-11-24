"use strict";

var describedClass = require("../../lib/sentient/instructionSet");
var Stack = require("../../lib/sentient/stack");
var SymbolTable = require("../../lib/sentient/symbolTable");
var Registry = require("../../lib/sentient/registry");
var CodeWriter = require("../../lib/sentient/codeWriter");

describe("InstructionSet", function () {
  var subject, stack, symbolTable, registry, codeWriter;

  beforeEach(function () {
    stack = new Stack();
    symbolTable = new SymbolTable();
    registry = new Registry();
    codeWriter = new CodeWriter();

    subject = new describedClass({
      stack: stack,
      symbolTable: symbolTable,
      registry: registry,
      codeWriter: codeWriter
    });
  });

  describe("push", function () {
    it("pushes the symbol onto the stack", function () {
      subject.push("foo");
      expect(stack.pop()).toEqual("foo");
    });

    describe("when the symbol table contains the symbol", function () {
      beforeEach(function () {
        symbolTable.set("foo", 1);
      });

      it("does not change the symbol table", function () {
        subject.push("foo");
        expect(symbolTable.get("foo")).toEqual(1);
      });

      it("does not write a clause", function () {
        spyOn(codeWriter, "clause");
        subject.push("foo");
        expect(codeWriter.clause).not.toHaveBeenCalled();
      });
    });

    describe("when the symbol table does not contain the symbol", function () {
      it("adds the symbol to the symbol table", function () {
        subject.push("foo");
        expect(symbolTable.get("foo")).toEqual(1);
      });

      it("writes a clause for the literal", function () {
        spyOn(codeWriter, "clause");
        subject.push("foo");
        expect(codeWriter.clause).toHaveBeenCalledWith(1, -1);
      });
    });
  });
});
