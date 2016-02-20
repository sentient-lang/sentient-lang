"use strict";

var describedClass = require("../../../lib/sentient/runtime/level3Runtime");

describe("Level3Runtime", function () {
  var program;

  describe("general behaviour", function () {
    beforeEach(function () {
      program = '                            \n\
        c Sentient Machine Code, Version 1.0 \n\
        c {                                  \n\
        c   "level3Variables": {             \n\
        c     "foo": {                       \n\
        c       "type": "boolean",           \n\
        c       "symbols": ["a"]             \n\
        c     },                             \n\
        c     "bar": {                       \n\
        c       "type": "integer",           \n\
        c       "symbols": ["b"],            \n\
        c       "supporting": true           \n\
        c     }                              \n\
        c   }                                \n\
        c }                                  \n\
      ';
    });

    it("throws an error when assigning to missing variables", function () {
      expect(function () {
        describedClass.encode(program, { missing: 123 });
      }).toThrow();
    });

    it("throws an error when assigning to supporting variables", function () {
      expect(function () {
        describedClass.encode(program, { bar: 123 });
      }).toThrow();
    });

    it("can return an empty set of results for no solution", function () {
      var results = describedClass.decode(program, {});
      expect(results).toEqual({});
    });

    it("throws an error if some results are missing", function () {
      expect(function () {
        describedClass.decode(program, {
          a: true
        });
      }).toThrow();
    });

    it("excludes supporting variables from the results", function () {
      var results = describedClass.decode(program, {
        a: true,
        b: true
      });

      expect(results).toEqual({
        foo: true
      });
    });
  });

  describe("primitives", function () {
    beforeEach(function () {
      program = '                            \n\
        c Sentient Machine Code, Version 1.0 \n\
        c {                                  \n\
        c   "level3Variables": {             \n\
        c     "foo": {                       \n\
        c       "type": "boolean",           \n\
        c       "symbols": ["a"]             \n\
        c     },                             \n\
        c     "bar": {                       \n\
        c       "type": "integer",           \n\
        c       "symbols": ["b"]             \n\
        c     }                              \n\
        c   }                                \n\
        c }                                  \n\
      ';
    });

    it("encodes booleans and integers", function () {
      var assignments = describedClass.encode(program, {
        foo: true,
        bar: 123
      });

      expect(assignments).toEqual({
        a: true,
        b: 123
      });
    });

    it("decodes booleans and integers", function () {
      var assignments = describedClass.decode(program, {
        a: true,
        b: 123
      });

      expect(assignments).toEqual({
        foo: true,
        bar: 123
      });
    });

    it("throws an error for type mismatches", function () {
      expect(function () {
        describedClass.encode(program, { foo: 123 });
      }).toThrow();

      expect(function () {
        describedClass.encode(program, { bar: true });
      }).toThrow();
    });
  });

  describe("arrays of primitives", function () {
    beforeEach(function () {
      program = '                             \n\
        c Sentient Machine Code, Version 1.0  \n\
        c {                                   \n\
        c   "level3Variables": {              \n\
        c     "bool1": {                      \n\
        c       "type": "boolean",            \n\
        c       "symbols": ["a"]              \n\
        c     },                              \n\
        c     "bool2": {                      \n\
        c       "type": "boolean",            \n\
        c       "supporting": true,           \n\
        c       "symbols": ["b"]              \n\
        c     },                              \n\
        c     "int1": {                       \n\
        c       "type": "integer",            \n\
        c       "supporting": true,           \n\
        c       "symbols": ["c"]              \n\
        c     },                              \n\
        c     "int2": {                       \n\
        c       "type": "integer",            \n\
        c       "supporting": true,           \n\
        c       "symbols": ["d"]              \n\
        c     },                              \n\
        c     "bools": {                      \n\
        c       "type": "array",              \n\
        c       "symbols": ["bool1", "bool2"] \n\
        c     },                              \n\
        c     "ints": {                       \n\
        c       "type": "array",              \n\
        c       "symbols": ["int1", "int2"]   \n\
        c     }                               \n\
        c   }                                 \n\
        c }                                   \n\
      ';
    });

    it("encodes arrays of booleans and integers", function () {
      var assignments = describedClass.encode(program, {
        bools: [true, false],
        ints: [123, 456]
      });

      expect(assignments).toEqual({
        a: true,
        b: false,
        c: 123,
        d: 456
      });
    });

    it("decodes arrays of booleans and integers", function () {
      var results = describedClass.decode(program, {
        a: true,
        b: false,
        c: 123,
        d: 456
      });

      expect(results).toEqual({
        bool1: true,
        bools: [true, false],
        ints: [123, 456]
      });
    });

    it("allows for partial assignments using 'undefined'", function () {
      var assignments = describedClass.encode(program, {
        bools: [true, undefined],
        ints: [undefined, 456]
      });

      expect(assignments).toEqual({
        a: true,
        d: 456
      });
    });

    it("allows for partial assignments using objects", function () {
      var assignments = describedClass.encode(program, {
        bools: { 0: true },
        ints: { 1: 456 }
      });

      expect(assignments).toEqual({
        a: true,
        d: 456
      });
    });

    it("throws an error on an assignment conflict", function () {
      expect(function () {
        describedClass.encode(program, {
          bools: { 0: true },
          bool1: false
        });
      }).toThrow();
    });

    it("does not throw on a duplicate assignment", function () {
      expect(function () {
        describedClass.encode(program, {
          bools: { 0: true },
          bool1: true
        });
      }).not.toThrow();
    });

    it("throws an error on a width mismatch", function () {
      expect(function () {
        describedClass.encode(program, {
          bools: [true]
        });
      }).toThrow();
    });
  });

  describe("arrays of arrays", function () {
    beforeEach(function () {
      program = '                               \n\
        c Sentient Machine Code, Version 1.0    \n\
        c {                                     \n\
        c   "level3Variables": {                \n\
        c     "foo": {                          \n\
        c       "type": "integer",              \n\
        c       "supporting": true,             \n\
        c       "symbols": ["a"]                \n\
        c     },                                \n\
        c     "bar": {                          \n\
        c       "type": "integer",              \n\
        c       "supporting": true,             \n\
        c       "symbols": ["b"]                \n\
        c     },                                \n\
        c     "baz": {                          \n\
        c       "type": "integer",              \n\
        c       "supporting": true,             \n\
        c       "symbols": ["c"]                \n\
        c     },                                \n\
        c     "array4": {                       \n\
        c       "type": "array",                \n\
        c       "symbols": ["array3"]           \n\
        c     },                                \n\
        c     "array1": {                       \n\
        c       "type": "array",                \n\
        c       "supporting": true,             \n\
        c       "symbols": ["foo", "bar"]       \n\
        c     },                                \n\
        c     "array2": {                       \n\
        c       "type": "array",                \n\
        c       "symbols": ["baz"]              \n\
        c     },                                \n\
        c     "array3": {                       \n\
        c       "type": "array",                \n\
        c       "supporting": true,             \n\
        c       "symbols": ["array1", "array2"] \n\
        c     }                                 \n\
        c   }                                   \n\
        c }                                     \n\
      ';
    });

    it("encodes arrays of arrays", function () {
      var assignments = describedClass.encode(program, {
        array4: [[[1, 2], [3]]]
      });

      expect(assignments).toEqual({
        a: 1,
        b: 2,
        c: 3
      });
    });

    it("decodes arrays of arrays", function () {
      var results = describedClass.decode(program, {
        a: 1,
        b: 2,
        c: 3
      });

      expect(results).toEqual({
        array2: [3],
        array4: [[[1, 2], [3]]]
      });
    });

    it("allows for partial assignments using 'undefined'", function () {
      var assignments = describedClass.encode(program, {
        array4: [[[undefined, 2], [undefined]]]
      });
      expect(assignments).toEqual({
        b: 2
      });

      assignments = describedClass.encode(program, {
        array4: [[undefined, [3]]]
      });
      expect(assignments).toEqual({
        c: 3
      });
    });

    it("allows for partial assignments using objects", function () {
      var assignments = describedClass.encode(program, {
        array4: {
          0: {
            0: { 1: 2 },
            1: { 0: 3 }
          }
        }
      });

      expect(assignments).toEqual({
        b: 2,
        c: 3
      });
    });

    it("throws an error on an assignment conflict", function () {
      expect(function () {
        describedClass.encode(program, {
          array2: [9],
          array4: [[[1, 2], [3]]]
        });
      }).toThrow();
    });

    it("does not throw on a duplicate assignment", function () {
      expect(function () {
        describedClass.encode(program, {
          array2: [3],
          array4: [[[1, 2], [3]]]
        });
      }).not.toThrow();
    });

    it("throws an error on a width mismatch", function () {
      expect(function () {
        describedClass.encode(program, {
          array4: [[[1], [3]]]
        });
      }).toThrow();
    });
  });
});
