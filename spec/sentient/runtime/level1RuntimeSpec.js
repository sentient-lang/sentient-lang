"use strict";

var describedClass = require("../../../lib/sentient/runtime/level1Runtime");

describe("Level1Runtime", function () {
  var program = {
    "level1Variables": {
      "a": 5,
      "a.b.c": 10,
      "d__": 15,
      "-e-": 20,
      "$F$": 25
    }
  };

  describe("encode", function () {
    it("encodes the variable assignments as literal assignments", function () {
      var assignments = describedClass.encode(program, {
        "a": true,
        "a.b.c": false,
        "d__": true
      });

      expect(assignments).toEqual({
        5: true,
        10: false,
        15: true
      });
    });

    it("throws an error when assigning something not in variables", function (){
      expect(function () {
        describedClass.encode(program, {
          "a": true,
          "missing": false
        });
      }).toThrow();
    });
  });

  describe("decode", function () {
    it("decodes the literal results as variable results", function () {
      var results = describedClass.decode(program, {
        5: true,
        10: false,
        15: true,
        20: false,
        25: true
      });

      expect(results).toEqual({
        "a": true,
        "a.b.c": false,
        "d__": true,
        "-e-": false,
        "$F$": true
      });
    });

    it("can return an empty set of results there's no solution", function () {
      var results = describedClass.decode(program, {});
      expect(results).toEqual({});
    });

    it("throws an error if some results are missing", function () {
      expect(function () {
        describedClass.decode(program, {
          5: true,
          10: false,
          25: true
        });
      }).toThrow();
    });
  });
});
