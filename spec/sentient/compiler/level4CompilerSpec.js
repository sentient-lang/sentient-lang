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

    var result = describedClass.compile("\n\
      int6 a, b;            \n\
      total = a + b;        \n\
      expose a, b, total;   \n\
    ", callbackObject);

    expect(result).toBeUndefined();
    expect(instructions.length).toBeGreaterThan(0);
    expect(metadata.source.substring(7, 17)).toEqual("int6 a, b;");
    expect(written).toEqual(true);
  });
});
