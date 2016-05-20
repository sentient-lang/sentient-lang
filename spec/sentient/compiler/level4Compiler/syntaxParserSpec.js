"use strict";

var SpecHelper = require("../../../specHelper");
var subject = SpecHelper.parserForRule("program");

describe("SyntaxParser", function () {
  it("parses a simple program", function () {
    var ast = subject.parse(' \n\
      int6 a, b;                     \n\
      total = a + b;                 \n\
      expose a, b, total;            \n\
    ');

    expect(ast).toEqual([
      { type: "declaration", value: [["int", 6], ["a", "b"]] },
      { type: "assignment", value: [["total"], [["+", "a", "b"]]] },
      { type: "expose", value: ["a", "b", "total"] }
    ]);
  });
});
