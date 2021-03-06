"use strict";

var describedClass = require("../../lib/sentient/compiler");

describe("Compiler", function () {
  it("handles errors gracefully", function () {
    var error;

    try {
      describedClass.compile("invalid syntax");
    } catch (e) {
      error = e;
    }

    expect(error.message.substring(0, 20)).toEqual("sentient:1:9: syntax");

    try {
      describedClass.compile("a = b;");
    } catch (e) {
      error = e;
    }

    expect(error.message.substring(0, 20)).toEqual("'b' must be declared");
  });
});
