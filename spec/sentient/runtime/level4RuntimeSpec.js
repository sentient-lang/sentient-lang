"use strict";

var describedClass = require("../../../lib/sentient/runtime/level4Runtime");

describe("Level3Runtime", function () {
  describe("encode", function () {
    it("passes the assignments through, untouched", function () {
      var assignments = describedClass.encode("anything", { foo: "bar" });
      expect(assignments).toEqual({ foo: "bar" });
    });
  });

  describe("decode", function () {
    it("passes the results through, untouched", function () {
      var results = describedClass.decode("anything", { foo: "bar" });
      expect(results).toEqual({ foo: "bar" });
    });
  });
});
