"use strict";

var compiler = "../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler");
var StandardLibrary = require(compiler + "/level4Compiler/standardLibrary");

describe("Level4Compiler", function () {
  var standardLibrary, withStandardLibrary;

  beforeEach(function () {
    standardLibrary = new StandardLibrary();

    withStandardLibrary = function (expected) {
      return {
        instructions: standardLibrary.instructions.concat(
          expected.instructions
        )
      };
    };
  });

  it("compiles a simple program", function () {
    var code = describedClass.compile("\n\
      int6 a, b;                       \n\
      total = a + b;                   \n\
      vary a, b, total;                \n\
    ");

    expect(code).toEqual(withStandardLibrary({
      instructions: [
        { type: "integer", symbol: "a", width: 6 },
        { type: "integer", symbol: "b", width: 6 },
        { type: "push", symbol: "a" },
        { type: "push", symbol: "b" },
        { type: "call", name: "+", width: 2 },
        { type: "pop", symbol: "$$$_L4_TMP1_$$$" },
        { type: "push", symbol: "$$$_L4_TMP1_$$$" },
        { type: "pop", symbol: "total" },
        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "total" }
      ]
    }));
  });
});
