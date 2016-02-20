"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level3Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/common/symbolTable");
var Registry = require(compiler + "/level3Compiler/registry");
var CodeWriter = require(compiler + "/level3Compiler/codeWriter");

describe("InstructionSet", function () {
  var subject, stack, typedefStack, symbolTable, registry, codeWriter, conditionalNils;

  beforeEach(function () {
    stack = new Stack();
    typedefStack = new Stack();
    symbolTable = new SymbolTable();
    registry = new Registry();
    codeWriter = new CodeWriter();
    conditionalNils = {};

    subject = new describedClass({
      stack: stack,
      typedefStack: typedefStack,
      symbolTable: symbolTable,
      registry: registry,
      codeWriter: codeWriter,
      conditionalNils: conditionalNils
    });
  });

  describe("call", function () {
    it("calls the method that handles the given instruction", function () {
      spyOn(subject, "push");
      subject.call({ type: "push", symbol: "foo" });
      expect(subject.push).toHaveBeenCalledWith("foo");

      spyOn(subject, "_boolean");
      subject.call({ type: "boolean", symbol: "foo" });
      expect(subject._boolean).toHaveBeenCalledWith("foo");

      spyOn(subject, "_integer");
      subject.call({ type: "integer", symbol: "foo", width: 6 });
      expect(subject._integer).toHaveBeenCalledWith("foo", 6);
    });

    it("throws an error on an unrecognised instruction", function () {
      expect(function () {
        subject.call({ type: "unrecognised" });
      }).toThrow();
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

    describe("when no width is specified", function () {
      it("throws an error", function () {
        expect(function () {
          subject._integer("foo");
        }).toThrow();
      });
    });

    describe("when an invalid width is specified", function () {
      it("throws an error", function () {
        expect(function () {
          subject._integer("foo", -1);
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

  describe("add", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols on the stack", function () {
      subject.add();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.add();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'add'", function () {
      spyOn(codeWriter, "instruction");
      subject.add();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "add" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.add();
        }).toThrow();
      });
    });
  });

  describe("subtract", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols on the stack", function () {
      subject.subtract();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.subtract();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'subtract'", function () {
      spyOn(codeWriter, "instruction");
      subject.subtract();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "subtract" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.subtract();
        }).toThrow();
      });
    });
  });

  describe("multiply", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols on the stack", function () {
      subject.multiply();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.multiply();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'multiply'", function () {
      spyOn(codeWriter, "instruction");
      subject.multiply();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "multiply" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.multiply();
        }).toThrow();
      });
    });
  });

  describe("divide", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols on the stack", function () {
      subject.divide();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.divide();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'divide'", function () {
      spyOn(codeWriter, "instruction");
      subject.divide();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "divide" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.divide();
        }).toThrow();
      });
    });
  });

  describe("modulo", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols on the stack", function () {
      subject.modulo();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.modulo();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'modulo'", function () {
      spyOn(codeWriter, "instruction");
      subject.modulo();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "modulo" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.modulo();
        }).toThrow();
      });
    });
  });

  describe("divmod", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("a");
      stack.push("b");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "integer", ["foo"]);
      symbolTable.set("b", "integer", ["bar"]);
    });

    it("replaces the top two symbols for two symbols", function () {
      subject.divmod();

      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("$$$_L3_TMP2_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbols to the symbol table", function () {
      subject.divmod();
      var quotientSymbol = stack.pop();
      var moduloSymbol = stack.pop();

      expect(symbolTable.type(quotientSymbol)).toEqual("integer");
      expect(symbolTable.symbols(quotientSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);

      expect(symbolTable.type(moduloSymbol)).toEqual("integer");
      expect(symbolTable.symbols(moduloSymbol)).toEqual(["$$$_L3_INTEGER2_$$$"]);
    });

    it("writes instructions for 'divmod'", function () {
      spyOn(codeWriter, "instruction");
      subject.divmod();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "foo" },
        { type: "push", symbol: "bar" },
        { type: "divmod" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" },
        { type: "pop", symbol: "$$$_L3_INTEGER2_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("a", "boolean", ["foo"]);

        expect(function () {
          subject.divmod();
        }).toThrow();
      });
    });
  });

  describe("negate", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["bar"]);
    });

    it("replaces the top symbol on the stack", function () {
      subject.negate();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.negate();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'modulo'", function () {
      spyOn(codeWriter, "instruction");
      subject.negate();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "bar" },
        { type: "negate" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["bar"]);

        expect(function () {
          subject.negate();
        }).toThrow();
      });
    });
  });

  describe("absolute", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["bar"]);
    });

    it("replaces the top symbol on the stack", function () {
      subject.absolute();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.absolute();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'modulo'", function () {
      spyOn(codeWriter, "instruction");
      subject.absolute();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "bar" },
        { type: "absolute" },
        { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["bar"]);

        expect(function () {
          subject.absolute();
        }).toThrow();
      });
    });
  });

  describe("lessthan", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["a"]);
      symbolTable.set("bar", "integer", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.lessthan();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.lessthan();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'lessthan'", function () {
      spyOn(codeWriter, "instruction");
      subject.lessthan();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "lessthan" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["a"]);

        expect(function () {
          subject.lessthan();
        }).toThrow();
      });
    });
  });

  describe("greaterthan", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["a"]);
      symbolTable.set("bar", "integer", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.greaterthan();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.greaterthan();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'greaterthan'", function () {
      spyOn(codeWriter, "instruction");
      subject.greaterthan();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "greaterthan" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["a"]);

        expect(function () {
          subject.greaterthan();
        }).toThrow();
      });
    });
  });

  describe("lessequal", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["a"]);
      symbolTable.set("bar", "integer", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.lessequal();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.lessequal();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'lessequal'", function () {
      spyOn(codeWriter, "instruction");
      subject.lessequal();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "lessequal" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["a"]);

        expect(function () {
          subject.lessequal();
        }).toThrow();
      });
    });
  });

  describe("greaterequal", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "integer", ["a"]);
      symbolTable.set("bar", "integer", ["b"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.greaterequal();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.greaterequal();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'greaterequal'", function () {
      spyOn(codeWriter, "instruction");
      subject.greaterequal();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "greaterequal" },
        { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
      ]);
    });

    describe("incorrect type", function () {
      it("throws an error", function () {
        symbolTable.set("foo", "boolean", ["a"]);

        expect(function () {
          subject.greaterequal();
        }).toThrow();
      });
    });
  });

  describe("duplicate", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
    });

    it("duplicates the symbol on top of the stack", function () {
      subject.duplicate();

      expect(stack.pop()).toEqual("foo");
      expect(stack.pop()).toEqual("foo");
      expect(stack.pop()).toEqual("bottom");
    });
  });

  describe("swap", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");
      stack.push("bar");
    });

    it("swaps the top two symbols on the stack", function () {
      subject.swap();

      expect(stack.pop()).toEqual("foo");
      expect(stack.pop()).toEqual("bar");
      expect(stack.pop()).toEqual("bottom");
    });
  });

  describe("invariant", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");

      symbolTable.set("foo", "boolean", ["a"]);
    });

    it("removes the symbol on top of the stack", function () {
      subject.invariant();
      expect(stack.pop()).toEqual("bottom");
    });

    it("writes instructions for 'invariant'", function () {
      spyOn(codeWriter, "instruction");
      subject.invariant();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "invariant" }
      ]);

      expect(codeWriter.instruction.calls.count()).toEqual(2);
    });
  });

  describe("variable", function () {
    beforeEach(function () {
      symbolTable.set("foo", "integer", ["a"]);
      symbolTable.set("bar", "array", ["foo"]);
      symbolTable.set("baz", "array", ["bar"]);
    });

    describe("primitives", function () {
      it("writes the variable with its type and symbols", function () {
        spyOn(codeWriter, "variable");
        subject.variable("foo");
        expect(codeWriter.variable).toHaveBeenCalledWith(
          "foo", "integer", ["a"], false
        );
      });

      it("writes instructions for 'variable'", function () {
        spyOn(codeWriter, "instruction");
        subject.variable("foo");

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "variable", symbol: "a" }
        ]);
      });
    });

    describe("arrays of primitives", function () {
      it("writes the variable as well as its primitive variables", function () {
        spyOn(codeWriter, "variable");
        subject.variable("bar");

        expect(codeWriter.variable.calls.argsFor(0)).toEqual(
          ["foo", "integer", ["a"], true]
        );

        expect(codeWriter.variable.calls.argsFor(1)).toEqual(
          ["bar", "array", ["foo"], false]
        );
      });

      it("writes instructions for 'variable'", function () {
        spyOn(codeWriter, "instruction");
        subject.variable("bar");

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "variable", symbol: "a" }
        ]);
      });
    });

    describe("arrays of arrays", function () {
      it("writes the variable as well as nested arrays", function () {
        spyOn(codeWriter, "variable");
        subject.variable("baz");

        expect(codeWriter.variable.calls.argsFor(0)).toEqual(
          ["foo", "integer", ["a"], true]
        );

        expect(codeWriter.variable.calls.argsFor(1)).toEqual(
          ["bar", "array", ["foo"], true]
        );

        expect(codeWriter.variable.calls.argsFor(2)).toEqual(
          ["baz", "array", ["bar"], false]
        );
      });

      it("writes instructions for 'variable'", function () {
        spyOn(codeWriter, "instruction");
        subject.variable("baz");

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "variable", symbol: "a" }
        ]);
      });
    });
  });

  describe("typedef", function () {
    describe("integer", function () {
      it("adds the type definition to the typedef stack", function () {
        subject.typedef("integer", 6);
        expect(typedefStack.pop()).toEqual({ type: "integer", width: 6 });
      });

      describe("when no width is specified", function () {
        it("throws an error", function () {
          expect(function () {
            subject.typedef("integer");
          }).toThrow();
        });
      });
    });

    describe("boolean", function () {
      it("adds the type definition to the typedef stack", function () {
        subject.typedef("boolean");
        expect(typedefStack.pop()).toEqual({ type: "boolean" });
      });
    });

    describe("array", function () {
      it("expands the type definition on the typedef stack", function () {
        subject.typedef("integer", 3);
        subject.typedef("array", 6);

        expect(typedefStack.pop()).toEqual({
          type: "array",
          width: 6,
          elements: {
            type: "integer",
            width: 3
          }
        });
      });

      describe("when the stack is empty", function () {
        it("throws an error", function () {
          expect(function () {
            subject.typedef("array", 6);
          }).toThrow();
        });
      });

      describe("when no width is specified", function () {
        it("throws an error", function () {
          subject.typedef("integer", 3);

          expect(function () {
            subject.typedef("array");
          }).toThrow();
        });
      });

      describe("when an invalid width is specified", function () {
        it("throws an error", function () {
          subject.typedef("integer", 3);

          expect(function () {
            subject.typedef("array", -1);
          }).toThrow();
        });
      });
    });

    describe("unrecognised type", function () {
      it("throws an error", function () {
        expect(function () {
          subject.typedef("unrecognised");
        }).toThrow();
      });
    });
  });

  describe("array", function () {
    describe("when the typedef stack is empty", function () {
      it("throws an error", function () {
        expect(function () {
          subject.array("foo", 3);
        }).toThrow();
      });
    });

    describe("when a width isn't specified", function () {
      it("throws an error", function () {
        typedefStack.push({ type: "boolean" });

        expect(function () {
          subject.array("foo");
        }).toThrow();
      });
    });

    describe("when an invalid width is specified", function () {
      it("throws an error", function () {
        typedefStack.push({ type: "boolean" });

        expect(function () {
          subject.array("foo", -1);
        }).toThrow();
      });
    });

    describe("when the array is already declared", function () {
      beforeEach(function () {
        symbolTable.set("foo", "anything", ["anything"]);
      });

      it("throws an error", function () {
        typedefStack.push({ type: "boolean" });

        expect(function () {
          subject.array("foo", 3);
        }).toThrow();
      });
    });

    describe("when the typedef stack contains a boolean", function () {
      beforeEach(function () {
        typedefStack.push({ type: "boolean" });
      });

      it("adds the array element symbols to the symbol table", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual(["$$$_L3_BOOLEAN1_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual(["$$$_L3_BOOLEAN2_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual(["$$$_L3_BOOLEAN3_$$$"]);
      });

      it("adds the array symbol to the symbol table", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("foo")).toEqual("array");
        expect(symbolTable.symbols("foo")).toEqual([
          "$$$_L3_ARRAY1_ELEMENT0_$$$",
          "$$$_L3_ARRAY1_ELEMENT1_$$$",
          "$$$_L3_ARRAY1_ELEMENT2_$$$"
        ]);
      });

      it("writes instructions to register the element symbols", function () {
        spyOn(codeWriter, "instruction");
        subject.array("foo", 3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "boolean", symbol: "$$$_L3_BOOLEAN1_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN2_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN3_$$$" }
        ]);
      });
    });

    describe("when the typedef stack contains an integer", function () {
      beforeEach(function () {
        typedefStack.push({ type: "integer", width: 6 });
      });

      it("adds the array element symbols to the symbol table", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual("integer");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual(["$$$_L3_INTEGER1_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual("integer");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual(["$$$_L3_INTEGER2_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual("integer");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual(["$$$_L3_INTEGER3_$$$"]);
      });

      it("adds the array symbol to the symbol table", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("foo")).toEqual("array");
        expect(symbolTable.symbols("foo")).toEqual([
          "$$$_L3_ARRAY1_ELEMENT0_$$$",
          "$$$_L3_ARRAY1_ELEMENT1_$$$",
          "$$$_L3_ARRAY1_ELEMENT2_$$$"
        ]);
      });

      it("writes instructions to register the element symbols", function () {
        spyOn(codeWriter, "instruction");
        subject.array("foo", 3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "integer", symbol: "$$$_L3_INTEGER1_$$$", width: 6 },
          { type: "integer", symbol: "$$$_L3_INTEGER2_$$$", width: 6 },
          { type: "integer", symbol: "$$$_L3_INTEGER3_$$$", width: 6 }
        ]);
      });
    });

    describe("when the typedef stack contains an array", function () {
      beforeEach(function () {
        typedefStack.push({
          type: "array",
          width: 2,
          elements: {
            type: "boolean"
          }
        });
      });

      it("recursively adds symbols for nested primitives", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("$$$_L3_ARRAY2_ELEMENT0_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY2_ELEMENT0_$$$")).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
        expect(symbolTable.type("$$$_L3_ARRAY2_ELEMENT1_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY2_ELEMENT1_$$$")).toEqual(["$$$_L3_BOOLEAN2_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY3_ELEMENT0_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY3_ELEMENT0_$$$")).toEqual(["$$$_L3_BOOLEAN3_$$$"]);
        expect(symbolTable.type("$$$_L3_ARRAY3_ELEMENT1_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY3_ELEMENT1_$$$")).toEqual(["$$$_L3_BOOLEAN4_$$$"]);

        expect(symbolTable.type("$$$_L3_ARRAY4_ELEMENT0_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY4_ELEMENT0_$$$")).toEqual(["$$$_L3_BOOLEAN5_$$$"]);
        expect(symbolTable.type("$$$_L3_ARRAY4_ELEMENT1_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_ARRAY4_ELEMENT1_$$$")).toEqual(["$$$_L3_BOOLEAN6_$$$"]);
      });

      it("recursively adds symbols for nested arrays", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual("array");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual([
          "$$$_L3_ARRAY2_ELEMENT0_$$$",
          "$$$_L3_ARRAY2_ELEMENT1_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual("array");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual([
          "$$$_L3_ARRAY3_ELEMENT0_$$$",
          "$$$_L3_ARRAY3_ELEMENT1_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual("array");
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual([
          "$$$_L3_ARRAY4_ELEMENT0_$$$",
          "$$$_L3_ARRAY4_ELEMENT1_$$$"
        ]);
      });

      it("adds the top-level array symbol to the symbol table", function () {
        subject.array("foo", 3);

        expect(symbolTable.type("foo")).toEqual("array");
        expect(symbolTable.symbols("foo")).toEqual([
          "$$$_L3_ARRAY1_ELEMENT0_$$$",
          "$$$_L3_ARRAY1_ELEMENT1_$$$",
          "$$$_L3_ARRAY1_ELEMENT2_$$$"
        ]);
      });

      it("writes instructions to register the primitive symbols", function () {
        spyOn(codeWriter, "instruction");
        subject.array("foo", 3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "boolean", symbol: "$$$_L3_BOOLEAN1_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN2_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN3_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN4_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN5_$$$" },
          { type: "boolean", symbol: "$$$_L3_BOOLEAN6_$$$" }
        ]);
      });
    });
  });

  describe("collect", function () {
    describe("creating an array of primitives", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("foo");
        stack.push("bar");
        stack.push("baz");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
        symbolTable.set("baz", "integer", ["c"]);
      });

      it("replaces the top N symbols for one symbol on the stack", function () {
        subject.collect(3);

        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.collect(3);

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("array")
        expect(symbolTable.symbols("$$$_L3_TMP1_$$$")).toEqual([
          "foo", "bar", "baz"
        ]);
      });
    });

    describe("creating an array of arrays", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("arr1");
        stack.push("arr2");

        symbolTable.set("bottom", "anything", ["anything"]);

        symbolTable.set("arr1", "array", ["foo"]);
        symbolTable.set("arr2", "array", ["bar"]);

        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
      });

      it("replaces the top N symbols for one symbol on the stack", function () {
        subject.collect(2);

        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.collect(2);

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("array")
        expect(symbolTable.symbols("$$$_L3_TMP1_$$$")).toEqual([
          "arr1", "arr2"
        ]);
      });
    });

    describe("creating an array of [int, bool]", function () {
      beforeEach(function () {
        stack.push("int");
        stack.push("bool");

        symbolTable.set("int", "integer", ["a"]);
        symbolTable.set("bool", "boolean", ["b"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.collect(2);
        }).toThrow();
      });
    });

    describe("creating an array of [int, [int]]", function () {
      beforeEach(function () {
        stack.push("int");
        stack.push("arrayOfInt");

        symbolTable.set("int", "integer", ["a"]);
        symbolTable.set("arrayOfInt", "array", ["int"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.collect(2);
        }).toThrow();
      });
    });

    describe("creating an array of [[int], [bool]]", function () {
      beforeEach(function () {
        stack.push("arrayOfInt");
        stack.push("arrayOfBool");

        symbolTable.set("int", "integer", ["a"]);
        symbolTable.set("bool", "bool", ["b"]);
        symbolTable.set("arrayOfInt", "array", ["int"]);
        symbolTable.set("arrayOfBool", "array", ["bool"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.collect(2);
        }).toThrow();
      });
    });

    describe("creating an array of [[[int]], [[bool]]]", function () {
      beforeEach(function () {
        stack.push("arrayOfArrayOfInt");
        stack.push("arrayOfArrayOfBool");

        symbolTable.set("int", "integer", ["a"]);
        symbolTable.set("bool", "boolean", ["b"]);
        symbolTable.set("arrayOfInt", "array", ["int"]);
        symbolTable.set("arrayOfBool", "array", ["bool"]);
        symbolTable.set("arrayOfArrayOfInt", "array", ["arrayOfInt"]);
        symbolTable.set("arrayOfArrayOfBool", "array", ["arrayOfBool"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.collect(2);
        }).toThrow();
      });
    });

    describe("creating an empty array", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("foo");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("foo", "integer", ["a"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.collect(0);
        }).toThrow();
      });
    });

    describe("creating an array of [[int, int], [int]]", function () {
      beforeEach(function () {
        stack.push("arr1");
        stack.push("arr2");

        symbolTable.set("arr1", "array", ["a", "b"]);
        symbolTable.set("arr2", "array", ["c"]);

        symbolTable.set("a", "integer", ["a"]);
        symbolTable.set("b", "integer", ["b"]);
        symbolTable.set("c", "integer", ["c"]);
      });

      it("does not throw an error", function () {
        expect(function () {
          subject.collect(2);
        }).not.toThrow();
      });
    });
  });

  describe("get", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("someArray");
      stack.push("key");

      symbolTable.set("someArray", "array", ["foo", "bar"]);
      symbolTable.set("key", "integer", ["k"]);
    });

    describe("getting from a non-array", function () {
      beforeEach(function () {
        symbolTable.set("someArray", "integer", ["foo"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.get(true);
        }).toThrow();
      });
    });

    describe("getting with a non-integer key", function () {
      beforeEach(function () {
        symbolTable.set("key", "boolean", ["k"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.get(true);
        }).toThrow();
      });
    });

    describe("getting from an array of integers", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
      });

      it("replaces the top two symbols on the stack", function () {
        subject.get(true);

        expect(stack.pop()).toEqual("$$$_L3_TMP2_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the value and nil symbols to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var nilSymbol = stack.pop();

        expect(symbolTable.type(valueSymbol)).toEqual("integer");
        expect(symbolTable.symbols(valueSymbol)).toEqual([
          "$$$_L3_INTEGER1_$$$"
        ]);

        expect(symbolTable.type(nilSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(nilSymbol)).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);
      });

      it("writes instructions for 'get'", function () {
        spyOn(codeWriter, "instruction");
        subject.get(true);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // k < 0
          { type: "push", symbol: "k" },
          { type: "constant", value: 0 },
          { type: "lessthan" },

          // k >= length
          { type: "push", symbol: "k" },
          { type: "constant", value: 2 },
          { type: "greaterequal" },

          // k is out of bounds
          { type: "or" },

          // outOfBounds
          { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" },

          // if k == 0
          { type: "push", symbol: "k" },
          { type: "constant", value: 0 },
          { type: "equal" },

          // a
          { type: "push", symbol: "a" },

          // else if k == 1
          { type: "push", symbol: "k" },
          { type: "constant", value: 1 },
          { type: "equal" },

          // b
          { type: "push", symbol: "b" },

          // else 0
          { type: "constant", value: 0 },
          { type: "if" },
          { type: "if" },

          // value
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
        ]);
      });
    });

    describe("getting from an array of booleans", function () {
      beforeEach(function () {
        symbolTable.set("foo", "boolean", ["a"]);
        symbolTable.set("bar", "boolean", ["b"]);
      });

      it("replaces the top two symbols on the stack", function () {
        subject.get(true);

        expect(stack.pop()).toEqual("$$$_L3_TMP2_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the value and nil symbols to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var nilSymbol = stack.pop();

        expect(symbolTable.type(valueSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(valueSymbol)).toEqual([
          "$$$_L3_BOOLEAN2_$$$"
        ]);

        expect(symbolTable.type(nilSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(nilSymbol)).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);
      });

      it("writes instructions for 'get'", function () {
        spyOn(codeWriter, "instruction");
        subject.get(true);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // k < 0
          { type: "push", symbol: "k" },
          { type: "constant", value: 0 },
          { type: "lessthan" },

          // k >= length
          { type: "push", symbol: "k" },
          { type: "constant", value: 2 },
          { type: "greaterequal" },

          // k is out of bounds
          { type: "or" },

          // outOfBounds
          { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" },

          // if k == 0
          { type: "push", symbol: "k" },
          { type: "constant", value: 0 },
          { type: "equal" },

          // a
          { type: "push", symbol: "a" },

          // else if k == 1
          { type: "push", symbol: "k" },
          { type: "constant", value: 1 },
          { type: "equal" },

          // b
          { type: "push", symbol: "b" },

          // else false
          { type: "constant", value: false },
          { type: "if" },
          { type: "if" },

          // value
          { type: "pop", symbol: "$$$_L3_BOOLEAN2_$$$" }
        ]);
      });
    });

    describe("getting from an array of arrays", function () {
      beforeEach(function () {
        symbolTable.set("foo", "array", ["abc", "def"]);
        symbolTable.set("bar", "array", ["ghi"]);

        symbolTable.set("abc", "integer", ["a"]);
        symbolTable.set("def", "integer", ["b"]);
        symbolTable.set("ghi", "integer", ["c"]);
      });

      it("replaces the top two symbols on the stack", function () {
        subject.get(true);

        expect(stack.pop()).toEqual("$$$_L3_TMP7_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the value and nil symbols to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var nilSymbol = stack.pop();

        expect(symbolTable.type(valueSymbol)).toEqual("array");
        expect(symbolTable.symbols(valueSymbol)).toEqual([
          "$$$_L3_TMP4_$$$",
          "$$$_L3_TMP6_$$$"
        ]);

        expect(symbolTable.type(nilSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(nilSymbol)).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);
      });

      it("adds the value's elements to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var elements = symbolTable.symbols(valueSymbol);

        expect(symbolTable.type(elements[0])).toEqual("integer");
        expect(symbolTable.symbols(elements[0])).toEqual([
          "$$$_L3_INTEGER2_$$$"
        ]);

        expect(symbolTable.type(elements[1])).toEqual("integer");
        expect(symbolTable.symbols(elements[1])).toEqual([
          "$$$_L3_INTEGER3_$$$"
        ]);
      });

      describe("when the nested array includes an empty array", function () {
        beforeEach(function () {
          symbolTable.set("foo", "array", []);
        });

        it("does not throw an error", function () {
          expect(function () {
            subject.get(true);
          }).not.toThrow();
        });
      });

      it("adds conditional nils for the smaller array", function () {
        subject.get(true);

        var newSymbol = stack.pop();
        var conditions = conditionalNils[newSymbol];

        expect(conditions).toEqual([
          { conditionSymbol: "$$$_L3_BOOLEAN2_$$$", nilIndex: 1 },
          { conditionSymbol: "$$$_L3_BOOLEAN1_$$$" }
        ]);
      });
    });

    describe("getting from an array with conditional nils", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);

        conditionalNils.someArray = [
          { conditionSymbol: "condition1", nilIndex: 1 },
          { conditionSymbol: "condition2", nilIndex: 3 },
          { conditionSymbol: "condition3" }
        ];
      });

      it("writes code for the conditional nils", function () {
        spyOn(codeWriter, "instruction");
        subject.get(true);

        var calls = SpecHelper.calls(codeWriter.instruction)
        var relevantCalls = calls.slice(0, 22);

        expect(relevantCalls).toEqual([
          // check bounds
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'lessthan' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 2 },
          { type: 'greaterequal' },
          { type: 'or' },

          // conditional1 && k == 1
          { type: 'push', symbol: 'condition1' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 1 },
          { type: 'equal' },
          { type: 'and' },
          { type: 'or' },

          // condition2 && k == 3
          { type: 'push', symbol: 'condition2' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 3 },
          { type: 'equal' },
          { type: 'and' },
          { type: 'or' },

          // condition3
          { type: 'push', symbol: 'condition3' },
          { type: 'or' },

          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' }
        ]);
      });

      it("leaves the conditions untouched for other fetches", function () {
        subject.get(true);

        expect(conditionalNils.someArray).toEqual([
          { conditionSymbol: "condition1", nilIndex: 1 },
          { conditionSymbol: "condition2", nilIndex: 3 },
          { conditionSymbol: "condition3" }
        ]);
      });
    });

    describe("getting without bounds checking", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);

        conditionalNils.someArray = [
          { conditionSymbol: "condition1", nilIndex: 1 },
          { conditionSymbol: "condition2", nilIndex: 3 }
        ];
      });

      it("doesn't write any condition checking code", function () {
        spyOn(codeWriter, "instruction");
        subject.get(false);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'equal' },
          { type: 'push', symbol: 'a' },

          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 1 },
          { type: 'equal' },
          { type: 'push', symbol: 'b' },

          { type: 'constant', value: 0 },
          { type: 'if' },
          { type: 'if' },

          { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' }
        ]);
      });
    });

    describe("getting a nested array that has conditional nils", function () {
      beforeEach(function () {
        symbolTable.set("foo", "array", ["a", "b"]);
        symbolTable.set("bar", "array", ["c"]);

        conditionalNils.foo = [
          { conditionSymbol: "condition1", nilIndex: 0 }
        ]

        symbolTable.set("a", "integer", ["x"]);
        symbolTable.set("b", "integer", ["y"]);
        symbolTable.set("c", "integer", ["z"]);
      });

      it("adds an additional conditional", function () {
        subject.get();
        var newSymbol = stack.pop();

        expect(conditionalNils[newSymbol]).toEqual([
          { conditionSymbol: '$$$_L3_BOOLEAN2_$$$', nilIndex: 1 },
          { conditionSymbol: 'condition1', nilIndex: 0 },
          { conditionSymbol: '$$$_L3_BOOLEAN1_$$$' }
        ]);
      });
    });

    describe("getting from an empty array", function () {
      beforeEach(function () {
        symbolTable.set("someArray", "array", []);
      });

      it("throws an error", function () {
        expect(function () {
          subject.get();
        }).toThrow();
      });
    });
  });

  describe("constant", function () {
    beforeEach(function () {
      stack.push("bottom");
    });

    describe("booleans", function () {
      it("pushes a symbol onto the stack", function () {
        subject.constant(true);
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the symbol to the symbol table", function () {
        subject.constant(true);

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("boolean");
        expect(symbolTable.symbols("$$$_L3_TMP1_$$$")).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);
      });

      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(true);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: true },
          { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
        ]);
      });
    });

    describe("integers", function () {
      it("pushes a symbol onto the stack", function () {
        subject.constant(3);
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the symbol to the symbol table", function () {
        subject.constant(3);

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("integer");
        expect(symbolTable.symbols("$$$_L3_TMP1_$$$")).toEqual([
          "$$$_L3_INTEGER1_$$$"
        ]);
      });

      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: 3 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
        ]);
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

  describe("equal", function () {
    describe("for two boolean types", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("a");
        stack.push("b");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("a", "boolean", ["foo"]);
        symbolTable.set("b", "boolean", ["bar"]);
      });

      it("replaces the top two symbols for one symbol", function () {
        subject.equal();
        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.equal();
        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
      });

      it("writes instructions for 'equal'", function () {
        spyOn(codeWriter, "instruction");
        subject.equal();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "push", symbol: "foo"},
          { type: "push", symbol: "bar"},
          { type: "equal" },
          { type: "pop", symbol: "$$$_L3_BOOLEAN1_$$$" }
        ]);
      });
    });

    describe("for two arrays", function () {
      describe("of the same width", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("arr1");
          stack.push("arr2");

          symbolTable.set("bottom", "anything", ["anything"]);
          symbolTable.set("arr1", "array", ["foo", "bar"]);
          symbolTable.set("arr2", "array", ["baz", "qux"]);

          symbolTable.set("foo", "integer", ["a"]);
          symbolTable.set("bar", "integer", ["b"]);
          symbolTable.set("baz", "integer", ["c"]);
          symbolTable.set("qux", "integer", ["d"]);
        });

        it("replaces the top two symbols for one symbol", function () {
          subject.equal();
          expect(stack.pop()).toEqual("$$$_L3_TMP3_$$$");
          expect(stack.pop()).toEqual("bottom");
        });

        it("adds the new symbol to the symbol table", function () {
          subject.equal();
          var newSymbol = stack.pop();

          expect(symbolTable.type(newSymbol)).toEqual("boolean");
          expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN3_$$$"]);
        });

        it("writes instructions for 'equal'", function () {
          spyOn(codeWriter, "instruction");
          subject.equal();

          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: 'push', symbol: 'a' },
            { type: 'push', symbol: 'c' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
            { type: 'push', symbol: 'b' },
            { type: 'push', symbol: 'd' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
            { type: 'and' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' }
          ]);
        });
      });

      describe("of different widths", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("arr1");
          stack.push("arr2");

          symbolTable.set("bottom", "anything", ["anything"]);
          symbolTable.set("arr1", "array", ["foo", "bar"]);
          symbolTable.set("arr2", "array", ["baz"]);

          symbolTable.set("foo", "integer", ["a"]);
          symbolTable.set("bar", "integer", ["b"]);
          symbolTable.set("baz", "integer", ["c"]);
        });

        it("replaces the top two symbols for one symbol", function () {
          subject.equal();
          expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
          expect(stack.pop()).toEqual("bottom");
        });

        it("adds the new symbol to the symbol table", function () {
          subject.equal();
          var newSymbol = stack.pop();

          expect(symbolTable.type(newSymbol)).toEqual("boolean");
          expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
        });

        it("always returns false", function () {
          spyOn(codeWriter, "instruction");
          subject.equal();

          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: 'constant', value: false },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' }
          ]);
        });
      });

      describe("nested arrays", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("arr1");
          stack.push("arr2");

          symbolTable.set("bottom", "anything", ["anything"]);
          symbolTable.set("arr1", "array", ["arr3", "arr4"]);
          symbolTable.set("arr2", "array", ["arr5", "arr6"]);

          symbolTable.set("arr3", "array", ["foo", "bar"]);
          symbolTable.set("arr4", "array", ["baz", "qux"]);
          symbolTable.set("arr5", "array", ["abc", "def"]);
          symbolTable.set("arr6", "array", ["ghi", "jkl"]);

          symbolTable.set("foo", "integer", ["a"]);
          symbolTable.set("bar", "integer", ["b"]);
          symbolTable.set("baz", "integer", ["c"]);
          symbolTable.set("qux", "integer", ["d"]);
          symbolTable.set("abc", "integer", ["e"]);
          symbolTable.set("def", "integer", ["f"]);
          symbolTable.set("ghi", "integer", ["g"]);
          symbolTable.set("jkl", "integer", ["h"]);
        });

        it("replaces the top two symbols for one symbol", function () {
          subject.equal();
          expect(stack.pop()).toEqual("$$$_L3_TMP7_$$$");
          expect(stack.pop()).toEqual("bottom");
        });

        it("adds the new symbol to the symbol table", function () {
          subject.equal();
          var newSymbol = stack.pop();

          expect(symbolTable.type(newSymbol)).toEqual("boolean");
          expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN7_$$$"]);
        });

        it("recursively calls equal to generate instructions", function () {
          spyOn(codeWriter, "instruction");
          subject.equal();

          // [[a, b], [c, d]] == [[e, f], [g, h]]
          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            // a == e
            { type: 'push', symbol: 'a' },
            { type: 'push', symbol: 'e' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },

            // b == f
            { type: 'push', symbol: 'b' },
            { type: 'push', symbol: 'f' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },

            // a == e && b == f
            { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
            { type: 'and' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },

            // c == g
            { type: 'push', symbol: 'c' },
            { type: 'push', symbol: 'g' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN4_$$$' },

            // d == h
            { type: 'push', symbol: 'd' },
            { type: 'push', symbol: 'h' },
            { type: 'equal' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN5_$$$' },

            // c == g && d == h
            { type: 'push', symbol: '$$$_L3_BOOLEAN4_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN5_$$$' },
            { type: 'and' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN6_$$$' },

            // (a == e && b == f) && (c == g && d == h)
            { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN6_$$$' },
            { type: 'and' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN7_$$$' }
          ]);
        });
      });
    });

    describe("for mismatched types", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("a");
        stack.push("b");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("a", "integer", ["foo"]);
        symbolTable.set("b", "boolean", ["bar"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.equal();
        }).toThrow();
      });
    });

    describe("arrays with mismatched types", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("arr1");
        stack.push("arr2");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("arr1", "array", ["foo", "bar"]);
        symbolTable.set("arr2", "array", ["baz", "qux"]);

        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
        symbolTable.set("baz", "boolean", ["c"]);
        symbolTable.set("qux", "boolean", ["d"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.equal();
        }).toThrow();
      });
    });
  });
});
