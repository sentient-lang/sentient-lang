"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/codeWriter");

describe("CodeWriter", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("writes the simplest program", function () {
    var code = subject.write();
    expect(code).toEqual({
      instructions: []
    });
  });

  it("can write instructions", function () {
    subject.instruction({ foo: "bar", baz: 123 });
    subject.instruction({ qux: "qux" });

    var code = subject.write();

    expect(code).toEqual({
      instructions: [
        { foo: "bar", baz: 123 },
        { qux: "qux" }
      ]
    });
  });
});
