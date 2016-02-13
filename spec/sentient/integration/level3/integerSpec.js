"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");
var Level2Compiler = require(compiler + "/level2Compiler");
var Level3Compiler = require(compiler + "/level3Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");
var Level2Runtime = require(runtime + "/level2Runtime");
var Level3Runtime = require(runtime + "/level3Runtime");

var Machine = require("../../../../lib/sentient/machine");

describe("Integration: 'integer'", function () {
  it("declares a variable of type integer", function () {
    var program = Level3Compiler.compile({
      instructions: [
        { type: "integer", symbol: "a", width: 4 },
        { type: "variable", symbol: "a" }
      ]
    });
    program = Level2Compiler.compile(program);
    program = Level1Compiler.compile(program);

    var assignments = Level3Runtime.encode(program, {});
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var result = Machine.run(program, assignments);

    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);

    expect(typeof result.a).toEqual("number");
  });

  it("throws an error if the width is mising", function () {
    expect(function () {
      Level3Compiler.compile({
        instructions: [
          { type: "integer", symbol: "a" }
        ]
      });
    }).toThrow();
  });
});
