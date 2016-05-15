"use strict";

var compiler = "../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler");

describe("Level4Compiler", function () {
  it("compiles a simple program", function () {
    expect(function () {
      describedClass.compile("\n\
        int6 a, b;            \n\
        total = a + b;        \n\
        vary a, b, total;     \n\
      ");
    }).not.toThrow();
  });
});
