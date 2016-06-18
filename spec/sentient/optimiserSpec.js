/* jshint evil:true */

"use strict";

var describedClass = require("../../lib/sentient/optimiser");
var Sentient = require("../../lib/sentient");

describe("Optimiser", function () {
  it("coerces input to JSON if it is a string", function () {
    var program = Sentient.compile("a = 2 + 2; expose a;");
    program = JSON.stringify(program);

    var result = describedClass.optimise(program);
    expect(result.dimacs.length).toBeLessThan(40);
  });
});
