"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/dynamicScope");
var SymbolTable = require(compiler + "/common/symbolTable");
var Registry = require(compiler + "/level3Compiler/registry");

describe("DynamicScope", function () {
  var subject, contextTable, localTable, registry;

  beforeEach(function () {
    contextTable = new SymbolTable();
    localTable = new SymbolTable();
    registry = new Registry();

    subject = new describedClass(contextTable, localTable, registry);
  });

  describe("when the symbol is in the context table", function () {
    beforeEach(function () {
      contextTable.set("x", "integer", ["a"]);
    });

    it("proxies operations to the context table", function () {
      expect(subject.type("x")).toEqual("integer");
      expect(subject.symbols("x")).toEqual(["a"]);
      expect(subject.contains("x")).toEqual(true);
    });

    it("mutates the context table", function () {
      subject.set("x", "boolean", ["b"]);

      expect(contextTable.type("x")).toEqual("boolean");
      expect(contextTable.symbols("x")).toEqual(["b"]);
      expect(contextTable.contains("x")).toEqual(true);
    });

    it("does not mutate the local table", function () {
      subject.set("x", "boolean", ["b"]);

      expect(localTable.contains("x")).toEqual(false);
    });

    describe("when the forceLocal argument is true", function () {
      it("mutates the local table instead of the context table", function () {
        subject.set("x", "boolean", ["b"], true);

        expect(localTable.type("x")).toEqual("boolean");
        expect(localTable.symbols("x")).toEqual(["b"]);
        expect(localTable.contains("x")).toEqual(true);
      });

      it("does not mutate the context table", function () {
        subject.set("x", "boolean", ["b"], true);

        expect(contextTable.type("x")).toEqual("integer");
        expect(contextTable.symbols("x")).toEqual(["a"]);
        expect(contextTable.contains("x")).toEqual(true);
      });
    });

    describe("and the symbol is an array type", function () {
      beforeEach(function () {
        contextTable.set("foo", "integer", ["q"]);
        localTable.set("bar", "integer", ["r"]);

        localTable.set("a", "array", ["foo"]);
        contextTable.set("b", "array", ["bar"]);

        subject.set("x", "array", ["a", "b"]);
      });

      it("recursively copies symbols from either target", function () {
        expect(contextTable.type("x")).toEqual("array");
      });
    });
  });

  describe("when the symbol is in the local table", function () {
    beforeEach(function () {
      localTable.set("x", "integer", ["a"]);
    });

    it("proxies operations to the local table", function () {
      expect(subject.type("x")).toEqual("integer");
      expect(subject.symbols("x")).toEqual(["a"]);
      expect(subject.contains("x")).toEqual(true);
    });

    it("mutates the local table", function () {
      subject.set("x", "boolean", ["b"]);

      expect(localTable.type("x")).toEqual("boolean");
      expect(localTable.symbols("x")).toEqual(["b"]);
      expect(localTable.contains("x")).toEqual(true);
    });

    it("does not mutate the context table", function () {
      subject.set("x", "boolean", ["b"]);

      expect(contextTable.contains("x")).toEqual(false);
    });
  });

  describe("when the symbol is in both tables", function () {
    beforeEach(function () {
      contextTable.set("x", "integer", ["a"]);
      localTable.set("x", "boolean", ["b"]);
    });

    it("proxies operations to the local table", function () {
      expect(subject.type("x")).toEqual("boolean");
      expect(subject.symbols("x")).toEqual(["b"]);
      expect(subject.contains("x")).toEqual(true);
    });

    it("mutates the local table", function () {
      subject.set("x", "array", ["foo"]);

      expect(localTable.type("x")).toEqual("array");
      expect(localTable.symbols("x")).toEqual(["foo"]);
      expect(localTable.contains("x")).toEqual(true);
    });

    it("does not mutate the context table", function () {
      subject.set("x", "array", ["foo"]);

      expect(contextTable.type("x")).toEqual("integer");
      expect(contextTable.symbols("x")).toEqual(["a"]);
      expect(contextTable.contains("x")).toEqual(true);
    });
  });

  describe("when the symbol is in neither table", function () {
    it("mutates the local table", function () {
      subject.set("x", "integer", ["a"]);

      expect(localTable.type("x")).toEqual("integer");
      expect(localTable.symbols("x")).toEqual(["a"]);
      expect(localTable.contains("x")).toEqual(true);
    });

    it("does not mutate the context table", function () {
      subject.set("x", "integer", ["a"]);

      expect(contextTable.contains("x")).toEqual(false);
    });
  });
});
