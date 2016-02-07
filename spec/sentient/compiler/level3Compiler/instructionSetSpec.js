"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level3Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/common/symbolTable");
var Registry = require(compiler + "/level3Compiler/registry");
var CodeWriter = require(compiler + "/level3Compiler/codeWriter");

describe("InstructionSet", function () {
  var subject, stack, typedefStack, symbolTable, registry, codeWriter;

  beforeEach(function () {
    stack = new Stack();
    typedefStack = new Stack();
    symbolTable = new SymbolTable();
    registry = new Registry();
    codeWriter = new CodeWriter();

    subject = new describedClass({
      stack: stack,
      typedefStack: typedefStack,
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
    });

    describe("unrecognised type", function () {
      it("throws an error", function () {
        expect(function () {
          subject.typedef("unrecognised");
        }).toThrow();
      });
    });
  });
});
