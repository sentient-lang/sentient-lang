"use strict";

var describedClass = require("../../../lib/sentient/runtime/level2Runtime");

describe("Level2Runtime", function () {
  var program = '                        \n\
    c Sentient Machine Code, Version 1.0 \n\
    c {                                  \n\
    c   "level2Variables": {             \n\
    c     "a": {                         \n\
    c       "type": "boolean",           \n\
    c       "symbols": ["foo"]           \n\
    c     },                             \n\
    c     "b": {                         \n\
    c       "type": "integer",           \n\
    c       "symbols": ["x", "y", "z"]   \n\
    c     }                              \n\
    c   }                                \n\
    c }                                  \n\
  ';

  describe("encode", function () {
    it("encodes the variable assignments", function () {
      var assignments = describedClass.encode(program, {
        a: true,
        b: -4
      });

      expect(assignments).toEqual({
        foo: true,
        x: true,
        y: false,
        z: false
      });
    });

    it("assigns integers that require fewer bits correct", function () {
      var assignments = describedClass.encode(program, { b: -1 });
      expect(assignments).toEqual({ x: true, y: true, z: true });

      assignments = describedClass.encode(program, { b: 1 });
      expect(assignments).toEqual({ x: false, y: false, z: true });
    });

    it("throws an error for missing variables", function () {
      expect(function () {
        describedClass.encode(program, { missing: false });
      }).toThrow();
    });

    it("throws an error for type mismatches", function () {
      expect(function () {
        describedClass.encode(program, { a: 123 });
      }).toThrow();

      expect(function () {
        describedClass.encode(program, { b: true });
      }).toThrow();
    });

    it("throws an error if integer is out-of-bounds", function () {
      expect(function () {
        describedClass.encode(program, { b: 4 });
      }).toThrow();
    });
  });

  describe("decode", function () {
    it("decodes the results", function () {
      var results = describedClass.decode(program, {
        foo: true,
        x: true,
        y: false,
        z: false
      });

      expect(results).toEqual({
        a: true,
        b: -4
      });
    });

    it("can return an empty set of results there's no solution", function () {
      var results = describedClass.decode(program, {});
      expect(results).toEqual({});
    });

    it("throws an error if some results are missing", function () {
      expect(function () {
        describedClass.decode(program, {
          foo: true,
          x: true
        });
      }).toThrow();
    });
  });
});
