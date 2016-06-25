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

    expect(code.instructions.length).toEqual(57);
  });

  it("can optionally take a callback object", function () {
    var instructions = [], metadata, written;

    var callbackObject = {
      call: function (instruction) {
        instructions.push(instruction);
      },
      metadata: function (object) {
        metadata = object;
      },
      write: function () {
        written = true;
      }
    };

    var result = describedClass.compile({
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
    }, callbackObject);

    expect(result).toBeUndefined();
    expect(instructions.length).toBeGreaterThan(0);
    expect(metadata).toBeDefined();
    expect(written).toEqual(true);
  });

  it("catches errors and re-packages them", function () {
    var error;

    try {
      describedClass.compile({
        instructions: [
          { type: "constant", value: 5 },
          { type: "not" }
        ]
      });
    } catch (e) {
      error = e;
    }

    expect(error.originatingLevel).toEqual(3);
    expect(error.level3Instruction).toEqual({ type: "not" });
    expect(error.message).toEqual("Wrong type for not: integer");
  });
});
