"use strict";

var compiler = "../../../../../lib/sentient/compiler";
var SyntaxParser = require(compiler + "/level4Compiler/syntaxParser");

describe("program", function () {
  var subject;

  beforeEach(function () {
    subject = new SyntaxParser();
  });

  it("parses programs", function () {
    expect(subject.parse("                \n\
      int6 a, b;                          \n\
      total = a + b;                      \n\
      vary a, b, total;                   \n\
    ")).toEqual([
      { type: "declaration", value: [["int", 6], ["a", "b"]] },
      { type: "assignment", value: [["total"], [["a", "b", "+"]]] },
      { type: "vary", value: ["a", "b", "total"] }
    ]);

    expect(subject.parse("                \n\
      int6 a, b, c;                       \n\
                                          \n\
      a2 = a * a;                         \n\
      b2 = b * b;                         \n\
      c2 = c * c;                         \n\
                                          \n\
      invariant a2 + b2 == c2;            \n\
      vary a, b, c;                       \n\
    ")).toEqual([
      { type: "declaration", value: [["int", 6], ["a", "b", "c"]] },

      { type: "assignment", value: [["a2"], [["a", "a", "*"]]] },
      { type: "assignment", value: [["b2"], [["b", "b", "*"]]] },
      { type: "assignment", value: [["c2"], [["c", "c", "*"]]] },

      { type: "invariant", value: [[["a2", "b2", "+"], "c2", "=="]] },
      { type: "vary", value: ["a", "b", "c"] }
    ]);
  });
});
