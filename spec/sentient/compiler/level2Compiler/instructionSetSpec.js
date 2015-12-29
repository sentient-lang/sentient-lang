"use strict";

var compiler = "../../../../lib/sentient/compiler";

var SpecHelper = require("../../../specHelper");
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

  describe("call", function () {
    it("calls the method that handles the given instruction", function () {
      spyOn(subject, "push");
      subject.call({ type: "push", symbol: "foo" });
      expect(subject.push).toHaveBeenCalledWith("foo");

      spyOn(subject, "_boolean");
      subject.call({ type: "boolean" });
      expect(subject._boolean).toHaveBeenCalled();

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

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "$$$_BOOLEAN1_$$$" },
        { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
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

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "$$$_INTEGER1_BIT0_$$$" },
        { type: "push", symbol: "$$$_INTEGER1_BIT1_$$$" },
        { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" },
        { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
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

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "true" },
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);
      });
    });

    describe("false", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(false);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "false" },
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);
      });
    });

    describe("positive integers", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "false" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" },
          { type: "true" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" },
          { type: "true" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" }
        ]);
      });
    });

    describe("negative integers", function () {
      it("writes instructions to register the symbol", function () {
        spyOn(codeWriter, "instruction");
        subject.constant(-3);

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "true" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" },
          { type: "false" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" },
          { type: "true" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" }
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
        expect(stack.pop()).toEqual("$$$_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.equal();
        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("boolean");
        expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_BOOLEAN1_$$$"]);
      });

      it("writes instructions for 'equal'", function () {
        spyOn(codeWriter, "instruction");
        subject.equal();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          { type: "push", symbol: "foo"},
          { type: "push", symbol: "bar"},
          { type: "equal" },
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
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
          symbolTable.set("a", "integer", ["foo", "bar"]);
          symbolTable.set("b", "integer", ["baz", "qux"]);
        });

        it("replaces the top two symbols for one symbol", function () {
          subject.equal();
          expect(stack.pop()).toEqual("$$$_TMP1_$$$");
          expect(stack.pop()).toEqual("bottom");
        });

        it("adds the new symbol to the symbol table", function () {
          subject.equal();
          var newSymbol = stack.pop();

          expect(symbolTable.type(newSymbol)).toEqual("boolean");
          expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_BOOLEAN1_$$$"]);
        });

        it("writes instructions for 'equal'", function () {
          spyOn(codeWriter, "instruction");
          subject.equal();

          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: "push", symbol: "foo"},
            { type: "push", symbol: "baz"},
            { type: "equal" },
            { type: "push", symbol: "bar"},
            { type: "push", symbol: "qux"},
            { type: "equal" },
            { type: "and" },
            { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
          ]);
        });
      });

      describe("of different widths", function () {
        beforeEach(function () {
          stack.push("bottom");
          stack.push("a");
          stack.push("b");

          symbolTable.set("bottom", "anything", ["anything"]);
          symbolTable.set("a", "integer", ["foo", "bar", "baz"]);
          symbolTable.set("b", "integer", ["qux", "abc"]);
        });

        it("pads the smaller width with the leading bit", function () {
          spyOn(codeWriter, "instruction");
          subject.equal();

          expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
            { type: "push", symbol: "foo"},
            { type: "push", symbol: "qux"},
            { type: "equal" },
            { type: "push", symbol: "bar"},
            { type: "push", symbol: "qux"},
            { type: "equal" },
            { type: "push", symbol: "baz"},
            { type: "push", symbol: "abc"},
            { type: "equal" },
            { type: "and" },
            { type: "and" },
            { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
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

  describe("add", function () {
    describe("for integers of equal width", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("a");
        stack.push("b");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("a", "integer", ["foo", "bar"]);
        symbolTable.set("b", "integer", ["baz", "qux"]);
      });

      it("replaces the top two symbols for one symbol", function () {
        subject.add();
        expect(stack.pop()).toEqual("$$$_TMP1_$$$");
        expect(stack.pop()).toEqual("bottom");
      });

      it("adds the new symbol to the symbol table", function () {
        subject.add();
        var newSymbol = stack.pop();

        expect(symbolTable.type(newSymbol)).toEqual("integer");
        expect(symbolTable.symbols(newSymbol)).toEqual([
          "$$$_INTEGER1_BIT0_$$$",
          "$$$_INTEGER1_BIT1_$$$",
          "$$$_INTEGER1_BIT2_$$$"
        ]);
      });

      it("writes instructions for 'add'", function () {
        spyOn(codeWriter, "instruction");
        subject.add();

        expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
          // === bit 2 ===
          // c_in = false
          { type: "false" },
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" },

          // l xor r
          { type: "push", symbol: "bar" },
          { type: "push", symbol: "qux" },
          { type: "not" },
          { type: "equal" },

          // sum = (l xor r) xor c_in
          { type: "push", symbol: "$$$_BOOLEAN1_$$$" },
          { type: "not" },
          { type: "equal" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" },

          // l xor r
          { type: "push", symbol: "bar" },
          { type: "push", symbol: "qux" },
          { type: "not" },
          { type: "equal" },

          // (l xor r) and c_in
          { type: "push", symbol: "$$$_BOOLEAN1_$$$" },
          { type: "and" },

          // a and b
          { type: "push", symbol: "bar" },
          { type: "push", symbol: "qux" },
          { type: "and" },

          // carry = (a and b) or ((l xor r) and c_in)
          { type: "or" },
          { type: "pop", symbol: "$$$_BOOLEAN2_$$$" },

          // === bit 1 ===
          // l xor r
          { type: "push", symbol: "foo" },
          { type: "push", symbol: "baz" },
          { type: "not" },
          { type: "equal" },

          // sum = (l xor r) xor c_in
          { type: "push", symbol: "$$$_BOOLEAN2_$$$" },
          { type: "not" },
          { type: "equal" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" },

          // l xor r
          { type: "push", symbol: "foo" },
          { type: "push", symbol: "baz" },
          { type: "not" },
          { type: "equal" },

          // (l xor r) and c_in
          { type: "push", symbol: "$$$_BOOLEAN2_$$$" },
          { type: "and" },

          // a and b
          { type: "push", symbol: "foo" },
          { type: "push", symbol: "baz" },
          { type: "and" },

          // c_in = (a and b) or ((l xor r) and c_in)
          { type: "or" },
          { type: "pop", symbol: "$$$_BOOLEAN3_$$$" },

          // === bit 0 ===
          // a == b
          { type: "push", symbol: "foo" },
          { type: "push", symbol: "baz" },
          { type: "equal" },

          // (a == b) && c_in
          { type: "push", symbol: "$$$_BOOLEAN3_$$$" },
          { type: "and" },

          // a == !b
          { type: "push", symbol: "foo" },
          { type: "push", symbol: "baz" },
          { type: "not" },
          { type: "equal" },

          // (a == !b) && !c_in
          { type: "push", symbol: "$$$_BOOLEAN3_$$$" },
          { type: "not" },
          { type: "and" },

          // sum = ((a == b) && c_in) || ((a == !b) && !c_in)
          { type: "or" },
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
        ]);
      });
    });

    describe("for non-integer types", function () {
      beforeEach(function () {
        stack.push("bottom");
        stack.push("a");
        stack.push("b");

        symbolTable.set("bottom", "anything", ["anything"]);
        symbolTable.set("a", "boolean", ["foo"]);
        symbolTable.set("b", "boolean", ["bar"]);
      });

      it("throws an error", function () {
        expect(function () {
          subject.add();
        }).toThrow();
      });
    });
  });

  describe("variable", function () {
    beforeEach(function () {
      symbolTable.set("foo", "integer", ["a", "b", "c"]);
    });

    it("writes the variable with its type and symbols", function () {
      spyOn(codeWriter, "variable");
      subject.variable("foo");
      expect(codeWriter.variable).toHaveBeenCalledWith(
        "foo", "integer", ["a", "b", "c"]
      );
    });

    it("writes instructions for 'variable'", function () {
      spyOn(codeWriter, "instruction");
      subject.variable("foo");

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" }
      ]);
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
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.and();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'and'", function () {
      spyOn(codeWriter, "instruction");
      subject.and();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "and" },
        { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
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

  describe("not", function () {
    beforeEach(function () {
      stack.push("bottom");
      stack.push("foo");

      symbolTable.set("bottom", "anything", ["anything"]);
      symbolTable.set("foo", "boolean", ["a"]);
    });

    it("replaces the top symbol on the stack", function () {
      subject.not();
      expect(stack.pop()).toEqual("$$$_TMP1_$$$");
      expect(stack.pop()).toEqual("bottom");
    });

    it("adds the new symbol to the symbol table", function () {
      subject.not();
      var newSymbol = stack.pop();

      expect(symbolTable.type(newSymbol)).toEqual("boolean");
      expect(symbolTable.symbols(newSymbol)).toEqual(["$$$_BOOLEAN1_$$$"]);
    });

    it("writes instructions for 'not'", function () {
      spyOn(codeWriter, "instruction");
      subject.not();

      expect(SpecHelper.calls(codeWriter.instruction)).toEqual([
        { type: "push", symbol: "a" },
        { type: "not" },
        { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
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
