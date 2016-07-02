"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: reserved names", function () {
  it("prevents function definitions for reserved names", function () {
    spyOn(console, "error");

    expect(function () {
      Sentient.compile("function buildArray () {};");
    }).toThrow();

    expect(function () {
      Sentient.compile("function upto () {};");
    }).toThrow();

    expect(function () {
      Sentient.compile("function downto () {};");
    }).toThrow();

    expect(function () {
      Sentient.compile("function times () {};");
    }).toThrow();

    expect(function () {
      Sentient.compile("function get () {};");
    }).toThrow();

    expect(function () {
      Sentient.compile("function [] () {};");
    }).toThrow();
  });
});
