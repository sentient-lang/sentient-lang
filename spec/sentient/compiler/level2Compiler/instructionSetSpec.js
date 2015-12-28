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

      it("replaces the top two symbols for one symbol on the stack", function () {
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

        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "push", symbol: "foo"},
        ]);

        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "push", symbol: "bar"},
        ]);

        expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
          { type: "equal" },
        ]);

        expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(4);
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

        it("replaces the top two symbols for one symbol on the stack", function () {
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

          expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
            { type: "push", symbol: "foo"},
          ]);

          expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
            { type: "push", symbol: "baz"},
          ]);

          expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
            { type: "equal" },
          ]);

          expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
            { type: "push", symbol: "bar"},
          ]);

          expect(codeWriter.instruction.calls.argsFor(4)).toEqual([
            { type: "push", symbol: "qux"},
          ]);

          expect(codeWriter.instruction.calls.argsFor(5)).toEqual([
            { type: "equal" },
          ]);

          expect(codeWriter.instruction.calls.argsFor(6)).toEqual([
            { type: "and" },
          ]);

          expect(codeWriter.instruction.calls.argsFor(7)).toEqual([
            { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
          ]);

          expect(codeWriter.instruction.calls.count()).toEqual(8);
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

          expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
            { type: "push", symbol: "foo"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
            { type: "push", symbol: "qux"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
            { type: "equal" }
          ]);

          expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
            { type: "push", symbol: "bar"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(4)).toEqual([
            { type: "push", symbol: "qux"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(5)).toEqual([
            { type: "equal" }
          ]);

          expect(codeWriter.instruction.calls.argsFor(6)).toEqual([
            { type: "push", symbol: "baz"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(7)).toEqual([
            { type: "push", symbol: "abc"}
          ]);

          expect(codeWriter.instruction.calls.argsFor(8)).toEqual([
            { type: "equal" }
          ]);

          expect(codeWriter.instruction.calls.argsFor(9)).toEqual([
            { type: "and" }
          ]);

          expect(codeWriter.instruction.calls.argsFor(10)).toEqual([
            { type: "and" }
          ]);

          expect(codeWriter.instruction.calls.argsFor(11)).toEqual([
            { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
          ]);

          expect(codeWriter.instruction.calls.count()).toEqual(12);
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

      it("replaces the top two symbols for one symbol on the stack", function () {
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

        // === bit 2 ===

        // c_in = false
        expect(codeWriter.instruction.calls.argsFor(0)).toEqual([
          { type: "false" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(1)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        // l xor r
        expect(codeWriter.instruction.calls.argsFor(2)).toEqual([
          { type: "push", symbol: "bar" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(3)).toEqual([
          { type: "push", symbol: "qux" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(4)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(5)).toEqual([
          { type: "equal" }
        ]);

        // sum = (l xor r) xor c_in
        expect(codeWriter.instruction.calls.argsFor(6)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(7)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(8)).toEqual([
          { type: "equal" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(9)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT2_$$$" }
        ]);

        // l xor r
        expect(codeWriter.instruction.calls.argsFor(10)).toEqual([
          { type: "push", symbol: "bar" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(11)).toEqual([
          { type: "push", symbol: "qux" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(12)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(13)).toEqual([
          { type: "equal" }
        ]);

        // (l xor r) and c_in
        expect(codeWriter.instruction.calls.argsFor(14)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN1_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(15)).toEqual([
          { type: "and" }
        ]);

        // a and b
        expect(codeWriter.instruction.calls.argsFor(16)).toEqual([
          { type: "push", symbol: "bar" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(17)).toEqual([
          { type: "push", symbol: "qux" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(18)).toEqual([
          { type: "and" }
        ]);

        // carry = (a and b) or ((l xor r) and c_in)
        expect(codeWriter.instruction.calls.argsFor(19)).toEqual([
          { type: "or" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(20)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN2_$$$" }
        ]);

        // === bit 1 ===

        // l xor r
        expect(codeWriter.instruction.calls.argsFor(21)).toEqual([
          { type: "push", symbol: "foo" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(22)).toEqual([
          { type: "push", symbol: "baz" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(23)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(24)).toEqual([
          { type: "equal" }
        ]);

        // sum = (l xor r) xor c_in
        expect(codeWriter.instruction.calls.argsFor(25)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN2_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(26)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(27)).toEqual([
          { type: "equal" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(28)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT1_$$$" }
        ]);

        // l xor r
        expect(codeWriter.instruction.calls.argsFor(29)).toEqual([
          { type: "push", symbol: "foo" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(30)).toEqual([
          { type: "push", symbol: "baz" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(31)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(32)).toEqual([
          { type: "equal" }
        ]);

        // (l xor r) and c_in
        expect(codeWriter.instruction.calls.argsFor(33)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN2_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(34)).toEqual([
          { type: "and" }
        ]);

        // a and b
        expect(codeWriter.instruction.calls.argsFor(35)).toEqual([
          { type: "push", symbol: "foo" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(36)).toEqual([
          { type: "push", symbol: "baz" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(37)).toEqual([
          { type: "and" }
        ]);

        // c_in = (a and b) or ((l xor r) and c_in)
        expect(codeWriter.instruction.calls.argsFor(38)).toEqual([
          { type: "or" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(39)).toEqual([
          { type: "pop", symbol: "$$$_BOOLEAN3_$$$" }
        ]);

        // === bit 0 ===

        // a == b
        expect(codeWriter.instruction.calls.argsFor(40)).toEqual([
          { type: "push", symbol: "foo" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(41)).toEqual([
          { type: "push", symbol: "baz" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(42)).toEqual([
          { type: "equal" }
        ]);

        // (a == b) && c_in
        expect(codeWriter.instruction.calls.argsFor(43)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN3_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(44)).toEqual([
          { type: "and" }
        ]);

        // a == !b
        expect(codeWriter.instruction.calls.argsFor(45)).toEqual([
          { type: "push", symbol: "foo" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(46)).toEqual([
          { type: "push", symbol: "baz" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(47)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(48)).toEqual([
          { type: "equal" }
        ]);

        // (a == !b) && !c_in
        expect(codeWriter.instruction.calls.argsFor(49)).toEqual([
          { type: "push", symbol: "$$$_BOOLEAN3_$$$" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(50)).toEqual([
          { type: "not" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(51)).toEqual([
          { type: "and" }
        ]);

        // sum = ((a == b) && c_in) || ((a == !b) && !c_in)
        expect(codeWriter.instruction.calls.argsFor(52)).toEqual([
          { type: "or" }
        ]);

        expect(codeWriter.instruction.calls.argsFor(53)).toEqual([
          { type: "pop", symbol: "$$$_INTEGER1_BIT0_$$$" }
        ]);

        expect(codeWriter.instruction.calls.count()).toEqual(54);
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
});
