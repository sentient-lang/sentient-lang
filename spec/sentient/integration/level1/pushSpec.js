"use strict";

var compiler = "../../../../lib/sentient/compiler";
var Level1Compiler = require(compiler + "/level1Compiler");

var runtime = "../../../../lib/sentient/runtime";
var Level1Runtime = require(runtime + "/level1Runtime");

var Machine = require("../../../../lib/sentient/machine");

var _ = require("underscore");

describe("Integration: 'push'", function () {
  it("can assign arbitrary values", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {});

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(_.keys(result)).toEqual(["a"]);
    expect(_.includes([true, false], result.a)).toEqual(true);
  });

  it("can assign 'true'", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {
      a: true
    });

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({ a: true });
  });

  it("can assign 'false'", function () {
    var program = Level1Compiler.compile({
      instructions: [
        { type: "push", symbol: "a" },
        { type: "variable", symbol: "a" }
      ]
    });

    var assignments = Level1Runtime.encode(program, {
      a: false
    });

    var result = Machine.run(program, assignments)[0];
    result = Level1Runtime.decode(program, result);

    expect(result).toEqual({ a: false });
  });
});
