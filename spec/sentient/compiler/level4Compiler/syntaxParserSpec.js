"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/syntaxParser");

describe("SyntaxParser", function () {
  it("parses a simple program", function () {
    var ast = describedClass.parse(' \n\
      int6 a, b;                     \n\
      total = a + b;                 \n\
      vary a, b, total;              \n\
    ');

    expect(ast).toEqual([
      { type: "declaration", value: [["int", 6], ["a", "b"]] },
      { type: "assignment", value: [["total"], [["a", ["b"], "+"]]] },
      { type: "vary", value: ["a", "b", "total"] }
    ]);
  });
});
