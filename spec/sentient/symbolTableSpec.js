"use strict";

var describedClass = require("../../lib/sentient/symbolTable");

describe("SymbolTable", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    subject.set("foo", 5);
    expect(subject.get("foo")).toEqual(5);

    subject.set("bar", 3);
    expect(subject.get("bar")).toEqual(3);

    subject.set("foo", 3);
    expect(subject.get("foo")).toEqual(3);
    expect(subject.get("bar")).toEqual(3);

    expect(subject.contains("foo")).toEqual(true);
    expect(subject.contains("missing")).toEqual(false);

    expect(function () {
      subject.get("missing");
    }).toThrow();
  });
});
