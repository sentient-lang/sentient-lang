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

  describe("call", function () {
    it("calls the method that handles the given instruction", function () {
      spyOn(subject, "push");
      subject.call({ type: "push", symbol: "foo" });
      expect(subject.push).toHaveBeenCalledWith("foo");

      spyOn(subject, "and");
      subject.call({ type: "and" });
      expect(subject.and).toHaveBeenCalled();

      spyOn(subject, "variable");
      subject.call({ type: "variable", symbol: "foo" });
      expect(subject.variable).toHaveBeenCalledWith("foo");
    });

    it("throws an error on an unrecognised instruction", function () {
      expect(function () {
        subject.call({ type: "unrecognised" });
      }).toThrow();
    });
  });

  describe("push", function () {
    it("pushes the symbol onto the stack", function () {
      subject.push("foo");
      expect(stack.pop()).toEqual("foo");
    });

    describe("when the symbol table contains the symbol", function () {
      beforeEach(function () {
        symbolTable.set("foo", 123);
      });

      it("does not change the symbol table", function () {
        subject.push("foo");
        expect(symbolTable.get("foo")).toEqual(123);
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

  describe("pop", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("top");

      symbolTable.set("bottom", 123);
      symbolTable.set("top", 456);
    });

    it("pops a symbol from the stack", function () {
      subject.pop("foo");
      expect(stack.pop()).toEqual("bottom");
    });

    describe("popping a symbol not in the symbol table", function () {
      it("adds the symbol to the symbol table", function () {
        subject.pop("new");
        expect(symbolTable.get("new")).toEqual(456);
      });
    });

    describe("popping a symbol in the symbol table", function () {
      it("reassigns the symbol to use the literal from the stack", function () {
        subject.pop("bottom");
        expect(symbolTable.get("bottom")).toEqual(456);
      });
    });

    describe("popping the symbol already at the top of the stack", function () {
      it("does not change the symbol table", function () {
        subject.pop("top");
        expect(symbolTable.get("top")).toEqual(456);
      });
    });
  });

  describe("not", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("top");

      symbolTable.set("bottom", 123);
      symbolTable.set("top", 456);
    });

    it("replaces the symbol on top of the stack", function () {
      subject.not();
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.not();
      var newSymbol = stack.pop();
      expect(symbolTable.get(newSymbol)).toEqual(1);
    });

    it("writes CNF clauses for 'not'", function () {
      spyOn(codeWriter, "clause");
      subject.not();

      expect(codeWriter.clause.calls.argsFor(0)).toEqual([456, 1]);
      expect(codeWriter.clause.calls.argsFor(1)).toEqual([-456, -1]);

      expect(codeWriter.clause.calls.count()).toEqual(2);
    });
  });

  describe("and", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", 123);
      symbolTable.set("a", 456);
      symbolTable.set("b", 789);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.and();
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.and();
      var newSymbol = stack.pop();
      expect(symbolTable.get(newSymbol)).toEqual(1);
    });

    it("writes CNF clauses for 'and'", function () {
      spyOn(codeWriter, "clause");
      subject.and();

      expect(codeWriter.clause.calls.argsFor(0)).toEqual([-456, -789, 1]);
      expect(codeWriter.clause.calls.argsFor(1)).toEqual([456, -1]);
      expect(codeWriter.clause.calls.argsFor(2)).toEqual([789, -1]);

      expect(codeWriter.clause.calls.count()).toEqual(3);
    });
  });

  describe("or", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", 123);
      symbolTable.set("a", 456);
      symbolTable.set("b", 789);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.or();
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.or();
      var newSymbol = stack.pop();
      expect(symbolTable.get(newSymbol)).toEqual(1);
    });

    it("writes CNF clauses for 'or'", function () {
      spyOn(codeWriter, "clause");
      subject.or();

      expect(codeWriter.clause.calls.argsFor(0)).toEqual([456, 789, -1]);
      expect(codeWriter.clause.calls.argsFor(1)).toEqual([-456, 1]);
      expect(codeWriter.clause.calls.argsFor(2)).toEqual([-789, 1]);

      expect(codeWriter.clause.calls.count()).toEqual(3);
    });
  });

  describe("equal", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", 123);
      symbolTable.set("a", 456);
      symbolTable.set("b", 789);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.equal();
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.equal();
      var newSymbol = stack.pop();
      expect(symbolTable.get(newSymbol)).toEqual(1);
    });

    it("writes CNF clauses for 'equal'", function () {
      spyOn(codeWriter, "clause");
      subject.equal();

      expect(codeWriter.clause.calls.argsFor(0)).toEqual([456, 789, 1]);
      expect(codeWriter.clause.calls.argsFor(1)).toEqual([456, -789, -1]);
      expect(codeWriter.clause.calls.argsFor(2)).toEqual([-456, 789, -1]);
      expect(codeWriter.clause.calls.argsFor(3)).toEqual([-456, -789, 1]);

      expect(codeWriter.clause.calls.count()).toEqual(4);
    });
  });

  describe("true", function () {
    beforeEach(function () {
      stack.push("bottom");
      symbolTable.set("bottom", 123);
    });

    it("pushes a special symbol onto the stack", function () {
      subject._true();
      expect(stack.pop()).toEqual("$$$_TRUE_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    describe("when the symbol table contains the symbol", function () {
      beforeEach(function () {
        symbolTable.set("$$$_TRUE_$$$", 456);
      });

      it("does not change the symbol table", function () {
        subject._true();
        expect(symbolTable.get("$$$_TRUE_$$$")).toEqual(456);
      });

      it("does not write a clause", function () {
        spyOn(codeWriter, "clause");
        subject._true();
        expect(codeWriter.clause).not.toHaveBeenCalled();
      });
    });

    describe("when the symbol table does not contain the symbol", function () {
      it("adds the symbol to the symbol table", function () {
        subject._true();
        expect(symbolTable.get("$$$_TRUE_$$$")).toEqual(1);
      });

      it("writes a CNF clause for 'true'", function () {
        spyOn(codeWriter, "clause");
        subject._true();
        expect(codeWriter.clause).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("false", function () {
    beforeEach(function () {
      stack.push("bottom");
      symbolTable.set("bottom", 123);
    });

    it("pushes a special symbol onto the stack", function () {
      subject._false();
      expect(stack.pop()).toEqual("$$$_FALSE_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    describe("when the symbol table contains the symbol", function () {
      beforeEach(function () {
        symbolTable.set("$$$_FALSE_$$$", 456);
      });

      it("does not change the symbol table", function () {
        subject._false();
        expect(symbolTable.get("$$$_FALSE_$$$")).toEqual(456);
      });

      it("does not write a clause", function () {
        spyOn(codeWriter, "clause");
        subject._false();
        expect(codeWriter.clause).not.toHaveBeenCalled();
      });
    });

    describe("when the symbol table does not contain the symbol", function () {
      it("adds the symbol to the symbol table", function () {
        subject._false();
        expect(symbolTable.get("$$$_FALSE_$$$")).toEqual(1);
      });

      it("writes a CNF clause for 'false'", function () {
        spyOn(codeWriter, "clause");
        subject._false();
        expect(codeWriter.clause).toHaveBeenCalledWith(-1);
      });
    });
  });

  describe("variable", function () {
    beforeEach(function () {
      symbolTable.set("foo", 123);
    });

    it("writes the variable with its literal", function () {
      spyOn(codeWriter, "variable");
      subject.variable("foo");
      expect(codeWriter.variable).toHaveBeenCalledWith("foo", 123);
    });
  });
});
