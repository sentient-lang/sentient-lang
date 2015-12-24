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

      expect(symbolTable.type("foo")).toEqual("boolean");
      expect(symbolTable.symbols("foo")).toEqual(["$$$_BOOLEAN1_$$$"]);
    });

    describe("when the boolean is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.boolean("foo");
        }).toThrow();
      })
    });
  });
});
