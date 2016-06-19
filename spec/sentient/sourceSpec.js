"use strict";

var describedClass = require("../../lib/sentient/source");
var Sentient = require("../../lib/sentient");

describe("Source", function () {
  it("prints the sourcer code of a program", function () {
    var program = Sentient.compile("a = 123; expose a;");
    var source = describedClass.retrieve(program);

    expect(source).toEqual("a = 123; expose a;");
  });

  it("coerces input to JSON if it is a string", function () {
    var program = Sentient.compile("a = 123; expose a;");
    program = JSON.stringify(program);
    var source = describedClass.retrieve(program);

    expect(source).toEqual("a = 123; expose a;");
  });
});
