/* jshint evil:true */

"use strict";

var describedClass = require("../../lib/sentient/runtime");
var Sentient = require("../../lib/sentient");

describe("Runtime", function () {
  it("coerces input to JSON if it is a string", function () {
    var program = Sentient.compile("a = 123; expose a;");
    program = JSON.stringify(program);

    var result = describedClass.run(program);
    expect(result).toEqual([{ a: 123 }]);
  });
});
