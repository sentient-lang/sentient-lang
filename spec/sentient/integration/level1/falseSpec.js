"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'false'", function () {
  it("pushes false onto the stack", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "false" },
        { type: "pop", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});
    var result = Machine.run(program, assignments);
    result = Level1Runtime.decode(program, result);
    expect(result.a).toEqual(false);
  });
});
