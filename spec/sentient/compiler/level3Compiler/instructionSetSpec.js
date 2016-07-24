"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
var describedClass = require(compiler + "/level3Compiler/instructionSet");
var Stack = require(compiler + "/common/stack");
var SymbolTable = require(compiler + "/level3Compiler/symbolTable");
var Registry = require(compiler + "/level3Compiler/registry");
var FunctionRegistry = require(compiler + "/level3Compiler/functionRegistry");
var CallStack = require(compiler + "/level3Compiler/callStack");
var CodeWriter = require(compiler + "/level3Compiler/codeWriter");

describe("InstructionSet", function () {
  var subject, stack, typedefStack, functionStack, symbolTable, registry,
    functionRegistry, codeWriter, callStack;

  beforeEach(function () {
    stack = new Stack();
    typedefStack = new Stack();
    functionStack = new Stack();
    symbolTable = new SymbolTable();
    registry = new Registry();
    functionRegistry = new FunctionRegistry(registry);
    codeWriter = new CodeWriter();
    callStack = new CallStack();

    subject = new describedClass({
      stack: stack,
      typedefStack: typedefStack,
      functionStack: functionStack,
      symbolTable: symbolTable,
      registry: registry,
      functionRegistry: functionRegistry,
      codeWriter: codeWriter,
      callStack: callStack
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
        { type: "boolean", symbol: "$$$_L3_BOOLEAN1_$$$" }
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
        { type: "integer", symbol: "$$$_L3_INTEGER1_$$$", width: 3 }
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
      expect(symbolTable.symbols(quotientSymbol)).toEqual([
        "$$$_L3_INTEGER1_$$$"
      ]);

      expect(symbolTable.type(moduloSymbol)).toEqual("integer");
      expect(symbolTable.symbols(moduloSymbol)).toEqual([
        "$$$_L3_INTEGER2_$$$"
      ]);
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
          "foo", "integer", ["a"], false, undefined
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
          ["foo", "integer", ["a"], true, undefined]
        );

        expect(codeWriter.variable.calls.argsFor(1)).toEqual(
          ["bar", "array", ["foo"], false, undefined]
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
          ["foo", "integer", ["a"], true, undefined]
        );

        expect(codeWriter.variable.calls.argsFor(1)).toEqual(
          ["bar", "array", ["foo"], true, undefined]
        );

        expect(codeWriter.variable.calls.argsFor(2)).toEqual(
          ["baz", "array", ["bar"], false, undefined]
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

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual([
          "$$$_L3_BOOLEAN2_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual([
          "$$$_L3_BOOLEAN3_$$$"
        ]);
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

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual(
          "integer"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT0_$$$")).toEqual([
          "$$$_L3_INTEGER1_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual(
          "integer"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT1_$$$")).toEqual([
          "$$$_L3_INTEGER2_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual(
          "integer"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY1_ELEMENT2_$$$")).toEqual([
          "$$$_L3_INTEGER3_$$$"
        ]);
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

        expect(symbolTable.type("$$$_L3_ARRAY2_ELEMENT0_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY2_ELEMENT0_$$$")).toEqual([
          "$$$_L3_BOOLEAN1_$$$"
        ]);
        expect(symbolTable.type("$$$_L3_ARRAY2_ELEMENT1_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY2_ELEMENT1_$$$")).toEqual([
          "$$$_L3_BOOLEAN2_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY3_ELEMENT0_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY3_ELEMENT0_$$$")).toEqual([
          "$$$_L3_BOOLEAN3_$$$"
        ]);
        expect(symbolTable.type("$$$_L3_ARRAY3_ELEMENT1_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY3_ELEMENT1_$$$")).toEqual([
          "$$$_L3_BOOLEAN4_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_ARRAY4_ELEMENT0_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY4_ELEMENT0_$$$")).toEqual([
          "$$$_L3_BOOLEAN5_$$$"
        ]);
        expect(symbolTable.type("$$$_L3_ARRAY4_ELEMENT1_$$$")).toEqual(
          "boolean"
        );
        expect(symbolTable.symbols("$$$_L3_ARRAY4_ELEMENT1_$$$")).toEqual([
          "$$$_L3_BOOLEAN6_$$$"
        ]);
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

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("array");
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

        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);

        symbolTable.set("arr1", "array", ["foo"]);
        symbolTable.set("arr2", "array", ["bar"]);
      });

      it("replaces the top N symbols for one symbol on the stack", function () {
        subject.collect(2);

        expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.collect(2);

        expect(symbolTable.type("$$$_L3_TMP1_$$$")).toEqual("array");
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

        symbolTable.set("a", "integer", ["a"]);
        symbolTable.set("b", "integer", ["b"]);
        symbolTable.set("c", "integer", ["c"]);

        symbolTable.set("arr1", "array", ["a", "b"]);
        symbolTable.set("arr2", "array", ["c"]);
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

      symbolTable.set("foo", "anything", []);
      symbolTable.set("bar", "anything", []);

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

        expect(stack.pop()).toEqual("$$$_L3_TMP4_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP3_$$$");
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
          "$$$_L3_BOOLEAN3_$$$"
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

          // inBounds
          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'not' },
          { type: "pop", symbol: "$$$_L3_BOOLEAN2_$$$" },
          { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },

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
          { type: "constant", value: -1 },
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

        expect(stack.pop()).toEqual("$$$_L3_TMP4_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP3_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the value and nil symbols to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var nilSymbol = stack.pop();

        expect(symbolTable.type(valueSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(valueSymbol)).toEqual([
          "$$$_L3_BOOLEAN4_$$$"
        ]);

        expect(symbolTable.type(nilSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(nilSymbol)).toEqual([
          "$$$_L3_BOOLEAN3_$$$"
        ]);
      });

      it("writes instructions for 'get'", function () {
        spyOn(codeWriter, "instruction");
        subject.get(true);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // k < 0
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'lessthan' },

          // k >= length
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 2 },
          { type: 'greaterequal' },

          // k is out of bounds
          { type: 'or' },
          { type: 'not' },

          // inBounds
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'not' },

          // if k == 0
          { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'equal' },

          // a
          { type: 'push', symbol: 'a' },

          // else if k == 1
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 1 },
          { type: 'equal' },

          // b
          { type: 'push', symbol: 'b' },

          // else false
          { type: 'constant', value: false },
          { type: 'if' },
          { type: 'if' },

          // value
          { type: 'pop', symbol: '$$$_L3_BOOLEAN4_$$$' }
        ]);
      });
    });

    describe("getting from an array of arrays", function () {
      beforeEach(function () {
        symbolTable.set("abc", "integer", ["a"]);
        symbolTable.set("def", "integer", ["b"]);
        symbolTable.set("ghi", "integer", ["c"]);

        symbolTable.set("foo", "array", ["abc", "def"]);
        symbolTable.set("bar", "array", ["ghi"]);
      });

      it("replaces the top two symbols on the stack", function () {
        subject.get(true);

        expect(stack.pop()).toEqual("$$$_L3_TMP9_$$$");
        expect(stack.pop()).toEqual("$$$_L3_TMP3_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the value and nil symbols to the symbol table", function () {
        subject.get(true);

        var valueSymbol = stack.pop();
        var nilSymbol = stack.pop();

        expect(symbolTable.type(valueSymbol)).toEqual("array");
        expect(symbolTable.symbols(valueSymbol)).toEqual([
          "$$$_L3_TMP6_$$$",
          "$$$_L3_TMP8_$$$"
        ]);

        expect(symbolTable.type(nilSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(nilSymbol)).toEqual([
          "$$$_L3_BOOLEAN3_$$$"
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
        var conditions = symbolTable.getNilConditions(newSymbol);

        expect(conditions).toEqual([
          { conditionSymbol: "$$$_L3_BOOLEAN4_$$$", nilIndex: 1 },
          { conditionSymbol: "$$$_L3_BOOLEAN2_$$$" }
        ]);
      });
    });

    describe("getting from an array with conditional nils", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);

        symbolTable.setNilConditions("someArray", [
          { conditionSymbol: "condition1", nilIndex: 1 },
          { conditionSymbol: "condition2", nilIndex: 3 },
          { conditionSymbol: "condition3" }
        ]);
      });

      it("writes code for the conditional nils", function () {
        spyOn(codeWriter, "instruction");
        subject.get(true);

        var calls = SpecHelper.calls(codeWriter.instruction);
        var relevantCalls = calls.slice(0, 26);

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

          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'not' },

          { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' }
        ]);
      });

      it("leaves the conditions untouched for other fetches", function () {
        subject.get(true);

        expect(symbolTable.getNilConditions("someArray")).toEqual([
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

        symbolTable.setNilConditions("someArray", [
          { conditionSymbol: "condition1", nilIndex: 1 },
          { conditionSymbol: "condition2", nilIndex: 3 }
        ]);
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

          { type: 'constant', value: -1 },
          { type: 'if' },
          { type: 'if' },

          { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' }
        ]);
      });
    });

    describe("getting a nested array that has conditional nils", function () {
      beforeEach(function () {
        symbolTable.set("a", "integer", ["x"]);
        symbolTable.set("b", "integer", ["y"]);
        symbolTable.set("c", "integer", ["z"]);

        symbolTable.set("foo", "array", ["a", "b"]);
        symbolTable.set("bar", "array", ["c"]);

        symbolTable.setNilConditions("foo", [
          { conditionSymbol: "condition1", nilIndex: 0 }
        ]);
      });

      it("adds an additional conditional", function () {
        subject.get();
        var newSymbol = stack.pop();

        expect(symbolTable.getNilConditions(newSymbol)).toEqual([
          { conditionSymbol: '$$$_L3_BOOLEAN3_$$$', nilIndex: 1 },
          { conditionSymbol: 'condition1', nilIndex: 0 },
          { conditionSymbol: '$$$_L3_BOOLEAN2_$$$' }
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

          symbolTable.set("foo", "integer", ["a"]);
          symbolTable.set("bar", "integer", ["b"]);
          symbolTable.set("baz", "integer", ["c"]);
          symbolTable.set("qux", "integer", ["d"]);

          symbolTable.set("arr1", "array", ["foo", "bar"]);
          symbolTable.set("arr2", "array", ["baz", "qux"]);
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
          expect(symbolTable.symbols(newSymbol)).toEqual([
            "$$$_L3_BOOLEAN7_$$$"
          ]);
        });
      });

      describe("of different widths", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("arr1");
          stack.push("arr2");

          symbolTable.set("bottom", "anything", ["anything"]);

          symbolTable.set("foo", "integer", ["a"]);
          symbolTable.set("bar", "integer", ["b"]);
          symbolTable.set("baz", "integer", ["c"]);

          symbolTable.set("arr1", "array", ["foo", "bar"]);
          symbolTable.set("arr2", "array", ["baz"]);
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
          expect(symbolTable.symbols(newSymbol)).toEqual([
            "$$$_L3_BOOLEAN1_$$$"
          ]);
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

        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
        symbolTable.set("baz", "boolean", ["c"]);
        symbolTable.set("qux", "boolean", ["d"]);

        symbolTable.set("arr1", "array", ["foo", "bar"]);
        symbolTable.set("arr2", "array", ["baz", "qux"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.equal();
        }).toThrow();
      });
    });
  });

  describe("bounds", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("array");
      stack.push("key");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "anything", []);
      symbolTable.set("b", "anything", []);
      symbolTable.set("array", "array", ["a", "b"]);
      symbolTable.set("key", "integer", ["k"]);
    });

    it("replaces the top two symbols for one symbol on the stack", function () {
      subject.bounds();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.bounds();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'bounds'", function () {
      spyOn(codeWriter, "instruction");
      subject.bounds();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: 'push', symbol: 'k' },
        { type: 'constant', value: 0 },
        { type: 'lessthan' },
        { type: 'push', symbol: 'k' },
        { type: 'constant', value: 2 },
        { type: 'greaterequal' },
        { type: 'or' },
        { type: 'not' },
        { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' }
      ]);
    });

    it("throws an error when checking bounds of a non-array", function () {
      symbolTable.set("array", "integer", ["a"]);

      expect(function () {
        subject.bounds();
      }).toThrow();
    });

    it("throws an error when checking bounds with a non-integer", function () {
      symbolTable.set("key", "boolean", ["a"]);

      expect(function () {
        subject.bounds();
      }).toThrow();
    });

    describe("when there are conditionalNils for the array", function () {
      beforeEach(function () {
        symbolTable.setNilConditions("array", [
          { conditionSymbol: "indexSpecificCondition", nilIndex: 1 },
          { conditionSymbol: "universalCondition" }
        ]);
      });

      it("writes instructions for 'bounds'", function () {
        spyOn(codeWriter, "instruction");
        subject.bounds();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'lessthan' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 2 },
          { type: 'greaterequal' },
          { type: 'or' },

          { type: 'push', symbol: 'indexSpecificCondition' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 1 },
          { type: 'equal' },
          { type: 'and' },
          { type: 'or' },

          { type: 'push', symbol: 'universalCondition' },
          { type: 'or' },

          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' }
        ]);
      });

      describe("when 'skipBoundaries' is true", function () {
        it("only checks the 'conditionalNils'", function () {
          spyOn(codeWriter, "instruction");
          subject.bounds(true);

          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: "constant", value: true },

            { type: 'push', symbol: 'indexSpecificCondition' },
            { type: 'push', symbol: 'k' },
            { type: 'constant', value: 1 },
            { type: 'equal' },
            { type: 'and' },
            { type: 'or' },

            { type: 'push', symbol: 'universalCondition' },
            { type: 'or' },

            { type: 'not' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' }
          ]);
        });
      });
    });
  });

  describe("width", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("array");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("a", "anything", []);
      symbolTable.set("b", "anything", []);
      symbolTable.set("c", "anything", []);
      symbolTable.set("array", "array", ["a", "b", "c"]);
    });

    it("replaces the top symbol on the stack", function () {
      subject.width();
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.width();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("integer");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
    });

    it("writes instructions for 'width'", function () {
      spyOn(codeWriter, "instruction");
      subject.width();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: 'constant', value: 3 },
        { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' }
      ]);
    });

    it("throws an error when checking width of a non-array", function () {
      symbolTable.set("array", "integer", ["a"]);

      expect(function () {
        subject.width();
      }).toThrow();
    });

    describe("when there are index specific conditionalNils", function () {
      beforeEach(function () {
        symbolTable.setNilConditions("array", [
          { conditionSymbol: "indexSpecificCondition", nilIndex: 1 }
        ]);
      });

      it("writes instructions for 'width'", function () {
        spyOn(codeWriter, "instruction");
        subject.width();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // if indexSpecificCondition then 0 else 1
          { type: 'push', symbol: 'indexSpecificCondition' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'constant', value: 0 },
          { type: 'constant', value: 1 },
          { type: 'if' },

          { type: 'constant', value: 2 },
          { type: 'add' },

          { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' }
        ]);
      });
    });

    describe("when there is a universal conditionalNil", function () {
      beforeEach(function () {
        symbolTable.setNilConditions("array", [
          { conditionSymbol: "universalCondition" }
        ]);
      });

      it("writes instructions for 'width'", function () {
        spyOn(codeWriter, "instruction");
        subject.width();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // if universalCondition then 0 else 1
          { type: 'push', symbol: 'universalCondition' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'constant', value: 0 },
          { type: 'constant', value: 1 },
          { type: 'if' },

          // if universalCondition then 0 else 1
          { type: 'push', symbol: 'universalCondition' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'constant', value: 0 },
          { type: 'constant', value: 1 },
          { type: 'if' },

          // if universalCondition then 0 else 1
          { type: 'push', symbol: 'universalCondition' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
          { type: 'constant', value: 0 },
          { type: 'constant', value: 1 },
          { type: 'if' },

          { type: 'constant', value: 0 },
          { type: 'add' },
          { type: 'add' },
          { type: 'add' },

          { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' }
        ]);
      });
    });
  });

  describe("fetch", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("array");
      stack.push("key");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "anything", []);
      symbolTable.set("bar", "anything", []);
      symbolTable.set("array", "array", ["foo", "bar"]);
      symbolTable.set("key", "integer", ["k"]);
    });

    describe("for an integer array", function () {
      beforeEach(function () {
        symbolTable.set("foo", "integer", ["a"]);
        symbolTable.set("bar", "integer", ["b"]);
      });

      it("replaces the top two symbols for one symbol", function () {
        subject.fetch();
        expect(stack.pop()).toEqual("$$$_L3_TMP4_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.fetch();
        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("integer");
        expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER1_$$$"]);
      });

      it("writes instructions for 'fetch'", function () {
        spyOn(codeWriter, "instruction");
        subject.fetch();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'lessthan' },
          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 2 },
          { type: 'greaterequal' },
          { type: 'or' },

          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
          { type: 'not' },
          { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },

          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 0 },
          { type: 'equal' },

          { type: 'push', symbol: 'a' },

          { type: 'push', symbol: 'k' },
          { type: 'constant', value: 1 },
          { type: 'equal' },

          { type: 'push', symbol: 'b' },

          { type: 'constant', value: -1 },
          { type: 'if' },
          { type: 'if' },

          { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' },
          { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
          { type: 'invariant' }
        ]);
      });

      describe("when a default is provided", function () {
        beforeEach(function () {
          stack.push("default");
          symbolTable.set("default", "integer", ["d"]);
        });

        it("writes instructions for 'fetch'", function () {
          spyOn(codeWriter, "instruction");
          subject.fetch(true);

          var calls = SpecHelper.calls(codeWriter.instruction);
          var relevantCalls = calls.slice(26, 32);

          expect(relevantCalls).toEqual([
            { type: 'pop', symbol: '$$$_L3_INTEGER1_$$$' },

            { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
            { type: 'push', symbol: '$$$_L3_INTEGER1_$$$' },
            { type: 'push', symbol: 'd' },
            { type: 'if' },

            { type: 'pop', symbol: '$$$_L3_INTEGER2_$$$' }
          ]);
        });

        it("throws an error if the default is the wrong type", function () {
          symbolTable.set("default", "boolean", ["d"]);

          expect(function () {
            subject.fetch(true);
          }).toThrow();
        });
      });
    });

    describe("for a boolean array", function () {
      beforeEach(function () {
        symbolTable.set("foo", "boolean", ["a"]);
        symbolTable.set("bar", "boolean", ["b"]);
      });

      it("replaces the top two symbols for one symbol", function () {
        subject.fetch();
        expect(stack.pop()).toEqual("$$$_L3_TMP4_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.fetch();
        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_BOOLEAN4_$$$"]);
      });

      it("writes instructions for 'fetch'", function () {
        spyOn(codeWriter, "instruction");
        subject.fetch();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: 'push', symbol: 'k' },
            { type: 'constant', value: 0 },
            { type: 'lessthan' },
            { type: 'push', symbol: 'k' },
            { type: 'constant', value: 2 },
            { type: 'greaterequal' },
            { type: 'or' },

            { type: 'not' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN1_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN1_$$$' },
            { type: 'not' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN2_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN2_$$$' },
            { type: 'not' },
            { type: 'pop', symbol: '$$$_L3_BOOLEAN3_$$$' },

            { type: 'push', symbol: 'k' },
            { type: 'constant', value: 0 },
            { type: 'equal' },

            { type: 'push', symbol: 'a' },

            { type: 'push', symbol: 'k' },
            { type: 'constant', value: 1 },
            { type: 'equal' },

            { type: 'push', symbol: 'b' },

            { type: 'constant', value: false },
            { type: 'if' },
            { type: 'if' },

            { type: 'pop', symbol: '$$$_L3_BOOLEAN4_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
            { type: 'invariant' }
        ]);
      });

      describe("when a default is provided", function () {
        beforeEach(function () {
          stack.push("default");
          symbolTable.set("default", "boolean", ["d"]);
        });

        it("writes instructions for 'fetch'", function () {
          spyOn(codeWriter, "instruction");
          subject.fetch(true);

          var calls = SpecHelper.calls(codeWriter.instruction);
          var relevantCalls = calls.slice(26, 32);

          expect(relevantCalls).toEqual([
            { type: 'pop', symbol: '$$$_L3_BOOLEAN4_$$$' },

            { type: 'push', symbol: '$$$_L3_BOOLEAN3_$$$' },
            { type: 'push', symbol: '$$$_L3_BOOLEAN4_$$$' },
            { type: 'push', symbol: 'd' },
            { type: 'if' },

            { type: 'pop', symbol: '$$$_L3_BOOLEAN5_$$$' }
          ]);
        });

        it("throws an error if the default is the wrong type", function () {
          symbolTable.set("default", "integer", ["d"]);

          expect(function () {
            subject.fetch(123);
          }).toThrow();
        });
      });
    });

    describe("for a nested array", function () {
      beforeEach(function () {
        symbolTable.set("a", "integer", ["x"]);
        symbolTable.set("b", "integer", ["y"]);

        symbolTable.set("foo", "array", ["a"]);
        symbolTable.set("bar", "array", ["b"]);
      });

      it("does not throw an error for a fetch without a default", function () {
        expect(function () {
          subject.fetch();
        }).not.toThrow();
      });

      it("throws an error for a fetch with a default", function () {
        expect(function () {
          subject.fetch([]);
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

    describe("for two integer types", function () {
      describe("of the same width", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("a");
          stack.push("b");

          symbolTable.set("bottom", "anything", ["anything"]);
          symbolTable.set("a", "integer", ["foo"]);
          symbolTable.set("b", "integer", ["bar"]);
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
          expect(symbolTable.symbols(newSymbol)).toEqual([
            "$$$_L3_BOOLEAN1_$$$"
          ]);
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
  });

  describe("define", function () {
    it("registers the function with the function registry", function () {
      subject.call({ type: "define", name: "foo", args: ["bar", "baz"] });
      subject.call({ type: "push", symbol: "bar" });
      subject.call({ type: "push", symbol: "baz" });
      subject.call({ type: "add" });
      subject.call({ type: "return", width: 1 });

      var fn = functionRegistry.get("foo");

      expect(fn.name).toEqual("foo");
      expect(fn.args).toEqual(["bar", "baz"]);
      expect(fn.body).toEqual([
        { type: "push", symbol: "bar" },
        { type: "push", symbol: "baz" },
        { type: "add" }
      ]);
      expect(fn.returns).toEqual(1);
      expect(fn.dynamic).toBeUndefined();
    });

    it("prevents immutable functions from being redefined", function () {
      subject.call({ type: "define", name: "foo", args: [], immutable: true });
      subject.call({ type: "return", width: 0 });

      expect(function () {
        subject.call({ type: "define", name: "foo", args: [] });
        subject.call({ type: "return", width: 0 });
      }).toThrow();
    });

    describe("when a dynamic scope is specified", function () {
      it("stores the boolean in the function registry", function () {
        subject.call({ type: "define", name: "foo", args: [], dynamic: true });
        subject.call({ type: "return", width: 0 });

        var fn = functionRegistry.get("foo");
        expect(fn.dynamic).toEqual(true);
      });
    });

    describe("when a name is not specified", function () {
      it("throws an error", function () {
        expect(function () {
          subject.call({ type: "define", args: [] });
        }).toThrow();
      });
    });

    describe("when args is not specified", function () {
      it("throws an error", function () {
        expect(function () {
          subject.call({ type: "define", name: "foo" });
        }).toThrow();
      });
    });

    describe("recursive definitions", function () {
      it("tracks the depth and pairs the return correctly", function () {
        // Define foo
        subject.call({ type: "define", name: "foo", args: ["a"] });

          // Define bar
          subject.call({ type: "define", name: "bar", args: ["b"] });
            subject.call({ type: "push", symbol: "x" });
          subject.call({ type: "return", width: 1 });

          // Define baz
          subject.call({ type: "define", name: "baz", args: ["c"] });
            subject.call({ type: "push", symbol: "y" });
            subject.call({ type: "call", name: "bar", width: 1 });

            // Define qux
            subject.call({ type: "define", name: "qux", args: ["d"] });
              subject.call({ type: "push", symbol: "z" });
              subject.call({ type: "call", name: "bar", width: 1 });
            subject.call({ type: "return", width: 2 });
          subject.call({ type: "return", width: 3 });
        subject.call({ type: "return", width: 4 });

        var fn = functionRegistry.get("foo");

        expect(fn.name).toEqual("foo");
        expect(fn.args).toEqual(["a"]);
        expect(fn.body).toEqual([
          { type: "define", name: "bar", args: ["b"] },
          { type: "push", symbol: "x" },
          { type: "return", width: 1 },
          { type: "define", name: "baz", args: ["c"] },
          { type: "push", symbol: "y" },
          { type: "call", name: "bar", width: 1 },
          { type: "define", name: "qux", args: ["d"] },
          { type: "push", symbol: "z" },
          { type: "call", name: "bar", width: 1 },
          { type: "return", width: 2 },
          { type: "return", width: 3 }
        ]);
        expect(fn.returns).toEqual(4);
      });
    });
  });

  describe("return", function () {
    it("registers the recorded function", function () {
      subject.call({ type: "define", name: "foo", args: ["a"] });
      subject.call({ type: "constant", value: 5 });
      subject.call({ type: "return", width: 1 });

      var fn = functionRegistry.get("foo");

      expect(fn.name).toEqual("foo");
      expect(fn.args).toEqual(["a"]);
      expect(fn.body).toEqual([{ type: "constant", value: 5 }]);
      expect(fn.returns).toEqual(1);
    });

    it("stops the function recording", function () {
      subject.call({ type: "define", name: "foo", args: ["a"] });
      subject.call({ type: "constant", value: 5 });
      subject.call({ type: "return", width: 1 });

      subject.constant(true);
      expect(stack.pop()).toEqual("$$$_L3_TMP1_$$$");
    });

    describe("when a width is not specified", function () {
      it("throws an error", function () {
        subject.define("foo", []);

        expect(function () {
          subject._return();
        }).toThrow();
      });
    });

    describe("when a function is not being recorded", function () {
      it("throws an error", function () {
        expect(function () {
          subject._return(1);
        }).toThrow();
      });
    });
  });

  describe("_call", function () {
    it("returns the resultant instruction set, for test purposes", function () {
      functionRegistry.register("foo", [], [], 0);
      var instructionSet = subject._call("foo", 0);

      expect(instructionSet.stack).toBeDefined();
      expect(instructionSet.symbolTable).toBeDefined();
    });

    describe("simple function", function () {
      beforeEach(function () {
        functionRegistry.register("double", ["x"], [
          { type: "push", symbol: "x" },
          { type: "push", symbol: "x" },
          { type: "add" }
        ], false, false, 1);
      });

      it("writes instructions for calling the function", function () {
        spyOn(codeWriter, "instruction");

        subject.constant(123);
        subject._call("double", 1);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: 123 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" },

          // Inside 'double'
          { type: "push", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "push", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "add" },
          { type: "pop", symbol: "$$$_L3_INTEGER2_$$$" }
        ]);
      });

      it("replaces the symbol on the stack", function () {
        subject.constant(123);
        subject._call("double", 1);

        var newSymbol = stack.pop();
        expect(newSymbol).toEqual("$$$_L3_TMP3_$$$");

        expect(function () {
          stack.pop();
        }).toThrow();
      });

      it("adds the new symbol to the symbol table", function () {
        subject.constant(123);
        subject._call("double", 1);

        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("integer");
        expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_L3_INTEGER2_$$$"]);
      });
    });

    describe("function with multiple arguments", function () {
      beforeEach(function () {
        functionRegistry.register("add", ["a", "b"], [
          { type: "push", symbol: "a" },
          { type: "push", symbol: "b" },
          { type: "add" }
        ], false, false, 1);
      });

      it("writes instructions for calling the function", function () {
        spyOn(codeWriter, "instruction");

        subject.constant(123);
        subject.constant(456);
        subject._call("add", 2);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: 123 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "constant", value: 456 },
          { type: "pop", symbol: "$$$_L3_INTEGER2_$$$" },

          // Inside 'add'
          { type: "push", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "push", symbol: "$$$_L3_INTEGER2_$$$" },
          { type: "add" },
          { type: "pop", symbol: "$$$_L3_INTEGER3_$$$" }
        ]);
      });
    });

    describe("function with multiple returns", function () {
      beforeEach(function () {
        functionRegistry.register("foo", [], [
          { type: "constant", value: 123 },
          { type: "constant", value: 456 }
        ], false, false, 2);
      });

      it("writes instructions for calling the function", function () {
        spyOn(codeWriter, "instruction");
        subject._call("foo", 0);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // Inside 'foo'
          { type: "constant", value: 123 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "constant", value: 456 },
          { type: "pop", symbol: "$$$_L3_INTEGER2_$$$" }
        ]);
      });

      it("adds the new symbols to the stack", function () {
        subject._call("foo", 0);

        var s1 = stack.pop();
        var s2 = stack.pop();

        expect(s1).toEqual("$$$_L3_TMP3_$$$");
        expect(s2).toEqual("$$$_L3_TMP4_$$$");
      });

      it("adds the new symbol to the symbol table", function () {
        subject._call("foo", 0);

        var s1 = stack.pop();
        var s2 = stack.pop();

        expect(symbolTable.type(s1)).toEqual("integer");
        expect(symbolTable.symbols(s1)).toEqual(["$$$_L3_INTEGER2_$$$"]);

        expect(symbolTable.type(s2)).toEqual("integer");
        expect(symbolTable.symbols(s2)).toEqual(["$$$_L3_INTEGER1_$$$"]);
      });
    });

    describe("function call with an array argument", function () {
      beforeEach(function () {
        functionRegistry.register("first", ["arr"], [
          { type: "push", symbol: "arr" },
          { type: "constant", value: 0 },
          { type: "fetch" }
        ], false, false, 1);
      });

      it("recursively copies over the array's symbols", function () {
        subject.constant(10);
        subject.constant(20);
        subject.collect(2);
        subject.constant(30);
        subject.collect(1);
        subject.collect(2);

        var instructionSet = subject._call("first", 1);
        var symbolTable = instructionSet.symbolTable;

        expect(symbolTable.type("arr")).toEqual("array");
        expect(symbolTable.symbols("arr")).toEqual([
          "$$$_L3_TMP7_$$$",
          "$$$_L3_TMP10_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_TMP7_$$$")).toEqual("array");
        expect(symbolTable.type("$$$_L3_TMP10_$$$")).toEqual("array");

        expect(symbolTable.symbols("$$$_L3_TMP7_$$$")).toEqual([
          "$$$_L3_TMP8_$$$",
          "$$$_L3_TMP9_$$$"
        ]);

        expect(symbolTable.symbols("$$$_L3_TMP10_$$$")).toEqual([
          "$$$_L3_TMP11_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_TMP8_$$$")).toEqual("integer");
        expect(symbolTable.type("$$$_L3_TMP9_$$$")).toEqual("integer");
        expect(symbolTable.type("$$$_L3_TMP11_$$$")).toEqual("integer");

        expect(symbolTable.symbols("$$$_L3_TMP8_$$$")).toEqual([
          "$$$_L3_INTEGER1_$$$"
        ]);

        expect(symbolTable.symbols("$$$_L3_TMP9_$$$")).toEqual([
          "$$$_L3_INTEGER2_$$$"
        ]);

        expect(symbolTable.symbols("$$$_L3_TMP11_$$$")).toEqual([
          "$$$_L3_INTEGER3_$$$"
        ]);
      });

      it("recursively copies over conditional nils", function () {
        // foo = [[[10]], [[20, 30], [40, 50]]]
        subject.constant(10);
        subject.collect(1);
        subject.collect(1);
        subject.constant(20);
        subject.constant(30);
        subject.collect(2);
        subject.constant(40);
        subject.constant(50);
        subject.collect(2);
        subject.collect(2);
        subject.collect(2);
        subject.pop("foo");

        // bar = foo[x][y]
        subject.push("foo");
        subject._integer("x", 6);
        subject.push("x");
        subject.fetch();
        subject._integer("y", 6);
        subject.push("y");
        subject.fetch();
        subject.pop("bar");
        subject.push("bar");

        var instructionSet = subject._call("first", 1);

        // Note: Conditional nils are keyed by level 3 symbols, but their values
        // are level 2 symbols, so we don't need to do any remapping. Yay!
        expect(instructionSet.symbolTable.getNilConditions("arr")).toEqual(
          symbolTable.getNilConditions("bar")
        );
      });
    });

    describe("function call with an array return value", function () {
      beforeEach(function () {
        functionRegistry.register("pairs", [], [
          { type: "constant", value: 10 },
          { type: "collect", width: 1 },
          { type: "constant", value: 20 },
          { type: "constant", value: 30 },
          { type: "collect", width: 2 },
          { type: "collect", width: 2 }
        ], false, false, 1);
      });

      it("recursively adds the new symbols to the symbol table", function () {
        subject._call("pairs", 0);
        var arraySymbol = stack.pop();

        expect(symbolTable.type(arraySymbol)).toEqual("array");
        expect(symbolTable.symbols(arraySymbol)).toEqual([
          "$$$_L3_TMP8_$$$",
          "$$$_L3_TMP10_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_TMP8_$$$")).toEqual("array");
        expect(symbolTable.symbols("$$$_L3_TMP8_$$$")).toEqual([
          "$$$_L3_TMP9_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_TMP10_$$$")).toEqual("array");
        expect(symbolTable.symbols("$$$_L3_TMP10_$$$")).toEqual([
          "$$$_L3_TMP11_$$$",
          "$$$_L3_TMP12_$$$"
        ]);

        expect(symbolTable.type("$$$_L3_TMP9_$$$")).toEqual("integer");
        expect(symbolTable.type("$$$_L3_TMP11_$$$")).toEqual("integer");
        expect(symbolTable.type("$$$_L3_TMP12_$$$")).toEqual("integer");
      });

      describe("when the array has conditional nils", function () {
        beforeEach(function () {
          functionRegistry.register("firstArray", [], [
            { type: "constant", value: 10 },
            { type: "collect", width: 1 },
            { type: "constant", value: 20 },
            { type: "constant", value: 30 },
            { type: "collect", width: 2 },
            { type: "collect", width: 2 },
            { type: "constant", value: 0 },
            { type: "fetch" },
            { type: "pop", symbol: "foo" },
            { type: "push", symbol: "foo" }
          ], false, false, 1);
        });

        it("recursively copies back the conditional nils", function () {
          var instructionSet = subject._call("firstArray", 0);
          var newSymbol = stack.pop();

          expect(symbolTable.getNilConditions(newSymbol)).toEqual(
            instructionSet.symbolTable.getNilConditions("foo")
          );
        });
      });
    });

    describe("directly recursive function", function () {
      it("throws an error on call", function () {
        functionRegistry.register("recursive", [], [
          { type: "call", name: "recursive", width: 0 }
        ], false, false, 0);

        expect(function () {
          subject._call("recursive", 0);
        }).toThrow();
      });
    });

    describe("indirectly recursive function", function () {
      it("throws an error on call", function () {
        functionRegistry.register("a", [], [
          { type: "call", name: "b", width: 0 }
        ], false, false, 0);

        functionRegistry.register("b", [], [
          { type: "call", name: "c", width: 0 }
        ], false, false, 0);

        functionRegistry.register("c", [], [
          { type: "call", name: "a", width: 0 }
        ], false, false, 0);

        expect(function () { subject._call("a", 0); }).toThrow();
        expect(function () { subject._call("b", 0); }).toThrow();
        expect(function () { subject._call("c", 0); }).toThrow();
      });
    });

    describe("dynamically scoped functions", function () {
      beforeEach(function () {
        functionRegistry.register("foo", ["y"], [
          { type: "push", symbol: "x" },
          { type: "push", symbol: "y" },
          { type: "add" }
        ], true, false, 1);
      });

      it("writes instructions for calling the function", function () {
        spyOn(codeWriter, "instruction");

        // x is set in the caller's context
        subject.constant(123);
        subject.pop("x");

        subject.constant(456);
        subject._call("foo", 1);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: 123 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" },

          { type: "constant", value: 456 },
          { type: "pop", symbol: "$$$_L3_INTEGER2_$$$" },

          // Inside 'foo'
          { type: "push", symbol: "$$$_L3_INTEGER1_$$$" },
          { type: "push", symbol: "$$$_L3_INTEGER2_$$$" },
          { type: "add" },
          { type: "pop", symbol: "$$$_L3_INTEGER3_$$$" }
        ]);
      });
    });

    describe("function with function arguments", function () {
      beforeEach(function () {
        functionRegistry.register("someFunc", ["x"], [
          { type: "push", symbol: "x" }
        ], false, false, 1);

        functionRegistry.register("foo", ["*func", "bar"], [
          { type: "push", symbol: "bar" },
          { type: "call", name: "func", width: 1 }
        ], false, false, 1);
      });

      it("writes instructions for calling the function", function () {
        spyOn(codeWriter, "instruction");

        subject.pointer("someFunc");
        subject.constant(123);
        subject._call("foo", 2);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "constant", value: 123 },
          { type: "pop", symbol: "$$$_L3_INTEGER1_$$$" }
        ]);
      });
    });

    describe("when a name isn't specified", function () {
      it("throws an error", function () {
        expect(function () {
          subject._call();
        }).toThrow();
      });
    });

    describe("when a width isn't specified", function () {
      it("throws an error", function () {
        functionRegistry.register("foo", [], [], 1);

        expect(function () {
          subject._call("foo");
        }).toThrow();
      });
    });

    describe("when the function isn't defined", function () {
      it("throws an error", function () {
        expect(function () {
          subject._call("foo", 1);
        }).toThrow();
      });
    });

    describe("when given the wrong number of arguments", function () {
      it("throws an error", function () {
        functionRegistry.register("foo", ["bar"], [], 0);

        expect(function () {
          subject._call("foo", 2);
        }).toThrow();
      });
    });
  });

  describe("pointer", function () {
    it("adds the pointer to the functionStack", function () {
      subject.pointer("foo");
      expect(functionStack.pop()).toEqual("foo");

      subject.pointer("*bar");
      expect(functionStack.pop()).toEqual("bar");
    });

    it("throws if a name is not provided", function () {
      expect(function () {
        subject.pointer();
      }).toThrow();
    });
  });

  describe("each", function () {
    beforeEach(function () {
      symbolTable.set("a", "boolean", ["x"]);
      symbolTable.set("b", "boolean", ["y"]);

      symbolTable.set("arr", "array", ["a", "b"]);

      functionRegistry.register(
        "func", ["element", "index", "isPresent"], [], false, false, 0
      );

      subject.push("arr");
      subject.pointer("func");
    });

    it("throws if the function is not registered", function () {
      subject.pointer("missing");

      expect(function () {
        subject.each();
      }).toThrow();
    });

    it("throws if array symbol's type is not an array", function () {
      symbolTable.set("arr", "boolean", ["x"]);

      expect(function () {
        subject.each();
      }).toThrow();
    });

    it("allows functions that take one argument", function () {
      functionRegistry.register("func", ["e"], [], false, false, 0);
      expect(function () { subject.each(); }).not.toThrow();
    });

    it("allows functions that take two arguments", function () {
      functionRegistry.register("func", ["e", "i"], [], false, false, 0);
      expect(function () { subject.each(); }).not.toThrow();
    });

    it("allows functions that take three arguments", function () {
      functionRegistry.register("func", ["e", "i", "p"], [], false, false, 0);
      expect(function () { subject.each(); }).not.toThrow();
    });

    it("does not allow functions that take zero arguments", function () {
      functionRegistry.register("func", [], [], false, false, 0);
      expect(function () { subject.each(); }).toThrow();
    });

    it("does not allow functions that take > 3 arguments", function () {
      functionRegistry.register(
        "func", ["e", "i", "p", "x"], [], false, false, 0
      );

      expect(function () { subject.each(); }).toThrow();
    });
  });

  describe("eachCombination", function () {
    beforeEach(function () {
      symbolTable.set("a", "boolean", ["x"]);
      symbolTable.set("b", "boolean", ["y"]);

      symbolTable.set("arr", "array", ["a", "b"]);

      functionRegistry.register(
        "func", ["e", "f", "i", "j", "p", "q"], [], false, false, 0
      );

      subject.push("arr");
      subject.pointer("func");
    });

    it("throws if the function is not registered", function () {
      subject.pointer("missing");

      expect(function () {
        subject.eachCombination();
      }).toThrow();
    });

    it("throws if array symbol's type is not an array", function () {
      symbolTable.set("arr", "boolean", ["x"]);

      expect(function () {
        subject.eachCombination(2);
      }).toThrow();
    });

    it("throws if width is 0", function () {
      expect(function () {
        subject.eachCombination(0);
      }).toThrow();
    });

    it("throws if width is larger than array width", function () {
      expect(function () {
        subject.eachCombination(3);
      }).toThrow();
    });

    it("allows functions that take one argument", function () {
      functionRegistry.register("func", ["e"], [], false, false, 0);
      expect(function () { subject.eachCombination(2); }).not.toThrow();
    });

    it("allows functions that take two arguments", function () {
      functionRegistry.register("func", ["e", "i"], [], false, false, 0);
      expect(function () { subject.eachCombination(2); }).not.toThrow();
    });

    it("allows functions that take three arguments", function () {
      functionRegistry.register("func", ["e", "i", "p"], [], false, false, 0);
      expect(function () { subject.eachCombination(2); }).not.toThrow();
    });

    it("does not allow functions that take zero arguments", function () {
      functionRegistry.register("func", [], [], false, false, 0);
      expect(function () { subject.eachCombination(2); }).toThrow();
    });

    it("does not allow functions that take > 3 arguments", function () {
      functionRegistry.register(
        "func", ["e", "i", "p", "x"], [], false, false, 0
      );

      expect(function () { subject.eachCombination(2); }).toThrow();
    });
  });
});
