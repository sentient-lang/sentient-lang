"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/symbolTable");

describe("SymbolTable", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("maps symbols to types and constituent symbols", function () {
    subject.set("foo", "integer", ["a", "b", "c"]);
    expect(subject.type("foo")).toEqual("integer");
    expect(subject.symbols("foo")).toEqual(["a", "b", "c"]);

    subject.set("bar", "boolean", ["baz"]);
    expect(subject.type("bar")).toEqual("boolean");
    expect(subject.symbols("bar")).toEqual(["baz"]);
  });

  it("overwrites symbols that already exist", function () {
    subject.set("foo", "integer", ["a", "b", "c"]);
    subject.set("foo", "boolean", ["bar"]);

    expect(subject.type("foo")).toEqual("boolean");
    expect(subject.symbols("foo")).toEqual(["bar"]);
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

  it("allows conditions to be set and retrieved", function () {
    subject.set("foo", "array", []);

    subject.setNilConditions("foo", "some conditions");
    expect(subject.getNilConditions("foo")).toEqual("some conditions");
  });

  it("throws an error if no conditions are given", function () {
    subject.set("foo", "array", []);

    expect(function () {
      subject.setNilConditions("foo");
    }).toThrow();
  });

  it("throws an error if the type is no an array", function () {
    subject.set("foo", "integer", []);

    expect(function () {
      subject.setNilConditions("foo", "some conditions");
    }).toThrow();
  });
});
