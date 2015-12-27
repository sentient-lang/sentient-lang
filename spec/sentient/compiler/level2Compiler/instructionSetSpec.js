"use strict";

var compiler = "../../../../lib/sentient/compiler";

var describedClass = require(compiler + "/level2Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/level2Compiler/symbolTable");
var Registry = require(compiler + "/level2Compiler/registry");
var CodeWriter = require(compiler + "/level2Compiler/codeWriter");

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

  describe("boolean", function () {
    it("adds the boolean to the symbol table", function () {
      subject._boolean("foo");
      subject._boolean("bar");

      expect(symbolTable.type("foo")).toEqual("boolean");
      expect(symbolTable.symbols("foo")).toEqual(["$$$_BOOLEAN1_$$$"]);

      expect(symbolTable.type("bar")).toEqual("boolean");
      expect(symbolTable.symbols("bar")).toEqual(["$$$_BOOLEAN2_$$$"]);
    });

    it("writes instructions to register the boolean's symbol", function () {
      spyOn(codeWriter, "instruction");
      subject._boolean("foo");

      expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
        { type: "push", symbol: "$$$_BOOLEAN1_$$$" }
      ]);

      expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
        { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
      ]);

      expect(codeWriter.instruction.calls.count()).toEqual(2);
    });

    describe("when the boolean is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject._boolean("foo");
        }).toThrow();
      });
    });
  });

  describe("integer", function () {
    it("adds the integer to the symbol table", function () {
      subject._integer("foo", 3);
      subject._integer("bar", 2);

      expect(symbolTable.type("foo")).toEqual("integer");
      expect(symbolTable.symbols("foo")).toEqual([
        "$$$_INTEGER1_BIT0_$$$",
        "$$$_INTEGER1_BIT1_$$$",
        "$$$_INTEGER1_BIT2_$$$"
      ]);

      expect(symbolTable.type("bar")).toEqual("integer");
      expect(symbolTable.symbols("bar")).toEqual([
        "$$$_INTEGER2_BIT0_$$$",
        "$$$_INTEGER2_BIT1_$$$"
      ]);
    });

    it("writes instructions to register the integer's symbols", function () {
      spyOn(codeWriter, "instruction");
      subject._integer("foo", 2);

      expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
        { type: "push", symbol: "$$$_INTEGER1_BIT0_$$$" }
      ]);

      expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
        { type: "push", symbol: "$$$_INTEGER1_BIT1_$$$" }
      ]);

      expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
        { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" }
      ]);

      expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
        { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
      ]);

      expect(codeWriter.instruction.calls.count()).toEqual(4);
    });

    describe("when the integer is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject._integer("foo", 3);
        }).toThrow();
      });
    });
  });

  describe("push", function () {
    describe("when the symbol table contains the symbol", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("pushes the symbol onto the stack", function () {
        subject.push("foo");
        expect(stack.pop()).toEqual("foo");
      });
    });

    describe("when the symbol table does not contain the symbol", function () {
      it("throws an error", function () {
        expect(function () {
          subject.push("foo");
        }).toThrow();
      });
    });
  });

  describe("pop", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("top");

      symbolTable.set("bottom", "boolean", ["$$$_BOOLEAN1_$$$"]);
      symbolTable.set("top", "integer", ["$$$_INTEGER1_BIT0_$$$"]);
    });

    it("pops a symbol from the stack", function () {
      subject.pop("foo");
      expect(stack.pop()).toEqual("bottom");
    });

    describe("popping a symbol not in the symbol table", function () {
      it("adds the symbol to the symbol table", function () {
        subject.pop("foo");

        expect(symbolTable.type("foo")).toEqual("integer");
        expect(symbolTable.symbols("foo")).toEqual(["$$$_INTEGER1_BIT0_$$$"]);
      });
    });

    describe("popping a symbol of the same type", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", [
          "$$$_INTEGER2_BIT0_$$$",
          "$$$_INTEGER2_BIT1_$$$"
        ]);
      });

      it("reassigns the symbol to the values on the stack", function () {
        subject.pop("foo");

        expect(symbolTable.type("foo")).toEqual("integer");
        expect(symbolTable.symbols("foo")).toEqual(["$$$_INTEGER1_BIT0_$$$"]);
      });
    });

    describe("popping a symbol of a different type", function () {
      beforeEach(function () {
        symbolTable.set("foo", "boolean", ["$$$_BOOLEAN2_$$$"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.pop("foo");
        }).toThrow();
      });
    });
  });

  describe("constant", function () {
    beforeEach(function () {
      stack.push("bottom");
    });

    it("pushes a symbol onto the stack", function () {
      subject.constant(true);
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the symbol to the symbol table", function () {
      subject.constant(true);

      expect(symbolTable.type("$$$_TMP1_$$$")).toEqual("boolean");
      expect(symbolTable.symbols("$$$_TMP1_$$$")).toEqual([
        "$$$_BOOLEAN1_$$$"
      ]);
    });

    describe("true", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(true);

        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "true" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(2);
      });
    });

    describe("false", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(false);

        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "false" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(2);
      });
    });

    describe("positive integers", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(3);

        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "false" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
          { type: "true" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(4)).toEqual([
          { type: "true" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(5)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(6);
      });
    });

    describe("negative integers", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(-3);

        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "true" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
          { type: "false" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(4)).toEqual([
          { type: "true" }
        ]);
        expect(codeWriter.instruction.calls.argsFor(5)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(6);
      });
    });

    describe("for an unsupported type", function () {
      it("throws an error", function () {
        expect(function () {
          subject.constant({});
        }).toThrow();
      });
    });
  });
});
