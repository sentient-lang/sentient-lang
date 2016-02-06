"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level3Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/common/symbolTable");
var Registry = require(compiler + "/level3Compiler/registry");
var CodeWriter = require(compiler + "/level3Compiler/codeWriter");

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
      expect(symbolTable.symbols("foo")).toEqual(["$$$_L3_BOOLEAN1_$$$"]);

      expect(symbolTable.type("bar")).toEqual("boolean");
      expect(symbolTable.symbols("bar")).toEqual(["$$$_L3_BOOLEAN2_$$$"]);
    });

    it("writes instructions to register the boolean's symbol", function () {
      spyOn(codeWriter, "instruction");
      subject._boolean("foo");

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "boolean", symbol: "$$$_L3_BOOLEAN1_$$$" },
      ]);
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
      expect(symbolTable.symbols("foo")).toEqual(["$$$_L3_INTEGER1_$$$"]);

      expect(symbolTable.type("bar")).toEqual("integer");
      expect(symbolTable.symbols("bar")).toEqual(["$$$_L3_INTEGER2_$$$"]);
    });

    it("writes instructions to register the integer's symbol", function () {
      spyOn(codeWriter, "instruction");
      subject._integer("foo", 3);

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "integer", symbol: "$$$_L3_INTEGER1_$$$", width: 3 },
      ]);
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

      symbolTable.set("bottom", "boolean", ["$$$_L3_BOOLEAN1_$$$"]);
      symbolTable.set("top", "integer", ["$$$_L3_INTEGER1_$$$"]);
    });

    it("pops a symbol from the stack", function () {
      subject.pop("foo");
      expect(stack.pop()).toEqual("bottom");
    });

    describe("popping a symbol not in the symbol table", function () {
      it("adds the symbol to the symbol table", function () {
        subject.pop("foo");

        expect(symbolTable.type("foo")).toEqual("integer");
        expect(symbolTable.symbols("foo")).toEqual(["$$$_L3_INTEGER1_$$$"]);
      });
    });

    describe("popping a symbol of the same type", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["$$$_L3_INTEGER2_$$$"]);
      });

      it("reassigns the symbol to the values on the stack", function () {
        subject.pop("foo");

        expect(symbolTable.type("foo")).toEqual("integer");
        expect(symbolTable.symbols("foo")).toEqual(["$$$_L3_INTEGER1_$$$"]);
      });
    });

    describe("popping a symbol of a different type", function () {
      beforeEach(function () {
        symbolTable.set("foo", "boolean", ["$$$_L3_BOOLEAN2_$$$"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.pop("foo");
        }).toThrow();
      });
    });
  });

  describe("and", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "boolean", ["a"]);
      symbolTable.set("bar", "boolean", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.and();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.and();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'and'", function () {
      spyOn(codeWriter, "instruction");
      subject.and();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "and" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect types", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "integer", ["a"]);

        expect(function () {
          subject.and();
        }).toThrow();
      });
    });
  });

  describe("or", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "boolean", ["a"]);
      symbolTable.set("bar", "boolean", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.or();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.or();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'or'", function () {
      spyOn(codeWriter, "instruction");
      subject.or();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "or" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect types", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "integer", ["a"]);

        expect(function () {
          subject.or();
        }).toThrow();
      });
    });
  });

  describe("not", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "boolean", ["a"]);
    });

    it("replaces the top symbol on the stack", function () {
      subject.not();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.not();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'not'", function () {
      spyOn(codeWriter, "instruction");
      subject.not();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "not" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "integer", ["a"]);

        expect(function () {
          subject.not();
        }).toThrow();
      });
    });
  });
});
