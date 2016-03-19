"use strict";

var compiler = "../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler");

describe("Level3Compiler", function () {
  it("compiles a simple program", function () {
    var code = describedClass.compile({
      metadata: {
        title: "Middle element",
        description: "Returns the third element in an array of 5 integers",
        author: "Chris Patuzzo",
        date: "2016-03-19"
      },
      instructions: [
        { type: "typedef", name: "integer", width: 6 },
        { type: "array", symbol: "myArray", width: 5 },

        { type: "push", symbol: "myArray" },
        { type: "constant", value: 2 },
        { type: "fetch" },
        { type: "pop", symbol: "middleElement" },

        { type: "variable", symbol: "myArray" },
        { type: "variable", symbol: "middleElement" }
      ]
    });

    expect(code.metadata.title).toEqual("Middle element");

    expect(code.metadata.level3Variables.middleElement).toEqual({
      type: "integer",
      symbols: ["$$$_L3_INTEGER7_$$$"]
    });

    expect(code.instructions.length).toEqual(55);
  });
});

