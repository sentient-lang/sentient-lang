"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/symbolTable");

describe("SymbolTable", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("maps symbols to types and constituent symbols", function () {
    subject.set("foo", "integer", ["bar", "baz"]);
    expect(subject.type("foo")).toEqual("integer");
    expect(subject.symbols("foo")).toEqual(["bar", "baz"]);

    subject.set("qux", "boolean", ["abc"]);
    expect(subject.type("qux")).toEqual("boolean");
    expect(subject.symbols("qux")).toEqual(["abc"]);

    subject.set("def", "array", ["ghi", "jkl"]);
    expect(subject.type("def")).toEqual("array");
    expect(subject.symbols("def")).toEqual(["ghi", "jkl"]);

    subject.set("mno", "hash", { pqr: "stu", vwx: "yza" });
    expect(subject.type("mno")).toEqual("hash");
    expect(subject.symbols("mno")).toEqual({ pqr: "stu", vwx: "yza" });
  });

  it("overwrites symbols that already exist", function () {
    subject.set("foo", "integer", ["foo", "bar"]);
    subject.set("foo", "boolean", ["baz"]);

    expect(subject.type("foo")).toEqual("boolean");
    expect(subject.symbols("foo")).toEqual(["baz"]);
  });

  it("supports checking whether the table contains a symbol", function () {
    subject.set("foo", "boolean", ["bar"]);

    expect(subject.contains("foo")).toEqual(true);
    expect(subject.contains("missing")).toEqual(false);
  });

  it("throws an error when the symbol is missing", function () {
    expect(function () {
      subject.type("missing");
    }).toThrow();

    expect(function () {
      subject.symbols("missing");
    }).toThrow();
  });

  it("throws an error if symbols has the wrong structure", function () {
    expect(function () {
      subject.set("foo", "boolean", { bar: "baz" });
    }).toThrow();

    expect(function () {
      subject.set("foo", "integer", { bar: "baz" });
    }).toThrow();

    expect(function () {
      subject.set("foo", "array", { bar: "baz" });
    }).toThrow();

    expect(function () {
      subject.set("foo", "hash", ["bar"]);
    }).toThrow();
  });

  it("throws an error on an unrecognised type", function () {
    expect(function () {
      subject.set("foo", "unrecognised", ["bar"]);
    }).toThrow();
  });
});
