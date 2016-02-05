"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/codeWriter");

describe("CodeWriter", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("writes the simplest program", function () {
    var code = subject.write();
    expect(code).toEqual({
      metadata: {
        level3Variables: {}
      },
      instructions: []
    });
  });

  it("can write instructions", function () {
    subject.instruction({ foo: "bar", baz: 123 });
    subject.instruction({ qux: "qux" });

    var code = subject.write();

    expect(code).toEqual({
      metadata: {
        level3Variables: {}
      },
      instructions: [
        { foo: "bar", baz: 123 },
        { qux: "qux" }
      ]
    });
  });

  it("can set the metadata", function () {
    subject.metadata({ foo: "bar", baz: 123 });
    var code = subject.write();

    expect(code).toEqual({
      metadata: {
        foo: "bar",
        baz: 123,
        level3Variables: {}
      },
      instructions: []
    });
  });

  it("can set the variables", function () {
    subject.variable("foo", "boolean", ["a"]);
    subject.variable("bar", "integer", ["b", "c"]);
    var code = subject.write();

    expect(code).toEqual({
      metadata: {
        level3Variables: {
          foo: { type: "boolean", symbols: ["a"] },
          bar: { type: "integer", symbols: ["b", "c"] }
        }
      },
      instructions: []
    });
  });

  it("can set the variables and the metadata together", function () {
    subject.variable("foo", "boolean", ["a"]);
    subject.metadata({ foo: "bar", baz: 123 });
    subject.variable("bar", "integer", ["b", "c"]);
    var code = subject.write();

    expect(code).toEqual({
      metadata: {
        foo: "bar",
        baz: 123,
        level3Variables: {
          foo: { type: "boolean", symbols: ["a"] },
          bar: { type: "integer", symbols: ["b", "c"] }
        }
      },
      instructions: []
    });
  });
});
