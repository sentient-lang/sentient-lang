"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'boolean'", function () {
  it("declares a variable of type boolean", function () {
    var program = Level2Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 4 },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level1Compiler.compile(program);

    var assignments = Level2Runtime.encode(program, {});
    assignments = Level1Runtime.encode(program, {});

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);

    expect(typeof result.a).toEqual("number");
  });

  it("throws an error if the width is mising", function () {
    expect(function () {
      Level2Compiler.compile({
        instructions: [
          { type: "integer", symbol: "a" }
        ]
      });
    }).toThrow();
  });
});
