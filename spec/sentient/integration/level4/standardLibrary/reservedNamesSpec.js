"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: reserved names", function () {
  it("prevents function definitions for reserved names", function () {
    expect(function () {
      Sentient.compile("function collect () {};");
    }).toThrow();
  });
});
