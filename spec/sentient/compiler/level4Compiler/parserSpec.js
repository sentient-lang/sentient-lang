"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/parser");

describe("Parser", function () {
  it("parses a simple program", function () {
    var ast = describedClass.parse(' \n\
      int6 a, b;                     \n\
      total = a + b;                 \n\
      vary a, b, total;              \n\
    ');

    expect(ast).toEqual("something");
  });
});
