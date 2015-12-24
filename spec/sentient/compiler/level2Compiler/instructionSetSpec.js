"use strict";

var compiler = "../../../../lib/sentient/compiler";

var describedClass = require(compiler + "/level2Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/level2Compiler/symbolTable");
var Registry = require(compiler + "/level2Compiler/registry");

describe("InstructionSet", function () {
  var subject, stack, symbolTable, registry;

  beforeEach(function () {
    stack = new Stack();
    symbolTable = new SymbolTable();
    registry = new Registry();

    subject = new describedClass({
      stack: stack,
      symbolTable: symbolTable,
      registry: registry
    });
  });

  describe("boolean", function () {
    it("adds the boolean to the symbol table", function () {
      subject.boolean("foo");
      subject.boolean("bar");

      expect(symbolTable.type("foo")).toEqual("boolean");
      expect(symbolTable.symbols("foo")).toEqual(["$$$_BOOLEAN1_$$$"]);

      expect(symbolTable.type("bar")).toEqual("boolean");
      expect(symbolTable.symbols("bar")).toEqual(["$$$_BOOLEAN2_$$$"]);
    });

    describe("when the boolean is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.boolean("foo");
        }).toThrow();
      });
    });
  });

  describe("integer", function () {
    it("adds the integer to the symbol table", function () {
      subject.integer("foo", 3);
      subject.integer("bar", 2);

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

    describe("when the integer is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.integer("foo", 3);
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
});
