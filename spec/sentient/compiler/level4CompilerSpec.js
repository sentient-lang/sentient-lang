"use strict";

var compiler = "../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler");

describe("Level4Compiler", function () {
  it("compiles a simple program", function () {
    expect(function () {
      describedClass.compile("\n\
        int6 a, b;            \n\
        total = a + b;        \n\
        expose a, b, total;   \n\
      ");
    }).not.toThrow();
  });

  it("can optionally take a callback object", function () {
    var instructions = [], written;

    var callbackObject = {
      call: function (instruction) {
        instructions.push(instruction);
      },
      write: function () {
        written = true;
      }
    };

    var result = describedClass.compile("\n\
      int6 a, b;            \n\
      total = a + b;        \n\
      expose a, b, total;   \n\
    ", callbackObject);

    expect(result).toBeUndefined();
    expect(instructions.length).toBeGreaterThan(0);
    expect(written).toEqual(true);
  });
});
