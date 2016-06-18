"use strict";

var describedClass = require("../../../lib/sentient/runtime/level3Runtime");

describe("Level3Runtime", function () {
  var program;

  describe("general behaviour", function () {
    beforeEach(function () {
      program = {
        "level3Variables": {
          "foo": {
            "type": "boolean",
            "symbols": ["a"]
          },
          "bar": {
            "type": "integer",
            "symbols": ["b"],
            "supporting": true
          }
        }
      };
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
      program = {
        "level3Variables": {
          "foo": {
            "type": "boolean",
            "symbols": ["a"]
          },
          "bar": {
            "type": "integer",
            "symbols": ["b"]
          }
        }
      };
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
      program = {
        "level3Variables": {
          "bool1": {
            "type": "boolean",
            "symbols": ["a"]
          },
          "bool2": {
            "type": "boolean",
            "supporting": true,
            "symbols": ["b"]
          },
          "int1": {
            "type": "integer",
            "supporting": true,
            "symbols": ["c"]
          },
          "int2": {
            "type": "integer",
            "supporting": true,
            "symbols": ["d"]
          },
          "bools": {
            "type": "array",
            "symbols": ["bool1", "bool2"]
          },
          "ints": {
            "type": "array",
            "symbols": ["int1", "int2"]
          }
        }
      };
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
      program = {
        "level3Variables": {
          "foo": {
            "type": "integer",
            "supporting": true,
            "symbols": ["a"]
          },
          "bar": {
            "type": "integer",
            "supporting": true,
            "symbols": ["b"]
          },
          "baz": {
            "type": "integer",
            "supporting": true,
            "symbols": ["c"]
          },
          "array4": {
            "type": "array",
            "symbols": ["array3"]
          },
          "array1": {
            "type": "array",
            "supporting": true,
            "symbols": ["foo", "bar"]
          },
          "array2": {
            "type": "array",
            "symbols": ["baz"]
          },
          "array3": {
            "type": "array",
            "supporting": true,
            "symbols": ["array1", "array2"]
          }
        }
      };
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

  describe("nullability of values", function () {
    beforeEach(function () {
      program = {
        "level3Variables": {
          "foo": {
            "type": "integer",
            "symbols": ["a"],
            "nilDecider": "bar"
          },
          "bar": {
            "type": "boolean",
            "symbols": ["b"]
          }
        }
      };
    });

    it("encodes the nilDecider symbol to true if null", function () {
      var assignments = describedClass.encode(program, {
        foo: null
      });
      expect(assignments).toEqual({
        b: true
      });
    });

    it("encodes the nilDecider symbol to false if not null", function () {
      var assignments = describedClass.encode(program, {
        foo: 123
      });
      expect(assignments).toEqual({
        a: 123,
        b: false
      });
    });

    it("encodes the nilDecider symbol to true if value is null", function () {
      var assignments = describedClass.encode(program, {
        foo: null
      });
      expect(assignments).toEqual({
        b: true
      });
    });

    it("allows for encoding of only the nilDecider", function () {
      var assignments = describedClass.encode(program, {
        bar: true
      });
      expect(assignments).toEqual({
        b: true
      });
    });

    it("throws an error if the assignments contradict", function () {
      expect(function () {
        describedClass.encode(program, {
          foo: 123,
          bar: true
        });
      }).toThrow();

      expect(function () {
        describedClass.encode(program, {
          foo: null,
          bar: false
        });
      }).toThrow();
    });

    it("decodes values as normal when 'nilDecider' is false", function () {
      var results = describedClass.decode(program, {
        a: 123,
        b: false
      });

      expect(results).toEqual({
        foo: 123,
        bar: false
      });
    });

    it("decodes values as null when 'nilDecider' is true", function () {
      var results = describedClass.decode(program, {
        a: 123,
        b: true
      });

      expect(results).toEqual({
        foo: null,
        bar: true
      });
    });

    it("throws an error if 'nilDecider' is missing from metadata", function () {
      program = {
        "level3Variables": {
          "foo": {
            "type": "integer",
            "symbols": ["a"],
            "nilDecider": "bar"
          }
        }
      };

      expect(function () {
        describedClass.encode(program, { foo: 123 });
      }).toThrow();

      expect(function () {
        describedClass.decode(program, { a: 123 });
      }).toThrow();
    });

    describe("arrays", function () {
      beforeEach(function () {
        program = {
          "level3Variables": {
            "arr": {
              "type": "array",
              "symbols": ["foo", "bar"]
            },
            "foo": {
              "type": "integer",
              "symbols": ["a"]
            },
            "bar": {
              "type": "integer",
              "symbols": ["b"],
              "nilDecider": "baz"
            },
            "baz": {
              "type": "boolean",
              "symbols": ["x"]
            }
          }
        };
      });

      it("encodes the nilDecider symbol to true if null", function () {
        var assignments = describedClass.encode(program, {
          arr: [123]
        });
        expect(assignments).toEqual({
          a: 123,
          x: true
        });
      });

      it("encodes the nilDecider symbol to false if not null", function () {
        var assignments = describedClass.encode(program, {
          arr: [123, 456]
        });
        expect(assignments).toEqual({
          a: 123,
          b: 456,
          x: false
        });
      });

      it("allows for encoding of only the nilDecider", function () {
        var assignments = describedClass.encode(program, {
          arr: { 0: 123 },
          baz: true
        });
        expect(assignments).toEqual({
          a: 123,
          x: true
        });
      });

      it("throws an error if the assignments contradict", function () {
        expect(function () {
          describedClass.encode(program, {
            arr: [123, 456],
            baz: true
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: [123],
            baz: false
          });
        }).toThrow();
      });

      it("decodes values as normal when 'nilDecider' is false", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 456,
          x: false
        });

        expect(results).toEqual({
          arr: [123, 456],
          foo: 123,
          bar: 456,
          baz: false
        });
      });

      it("decodes values as null when 'nilDecider' is true", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 456,
          x: true
        });

        expect(results).toEqual({
          arr: [123],
          foo: 123,
          bar: null,
          baz: true
        });
      });
    });

    describe("nested arrays", function () {
      beforeEach(function () {
        program = {
          "level3Variables": {
            "arr": {
              "type": "array",
              "symbols": ["arr1", "arr2"]
            },
            "arr1": {
              "type": "array",
              "symbols": ["foo", "bar"]
            },
            "arr2": {
              "type": "array",
              "symbols": ["baz", "qux"]
            },
            "foo": {
              "type": "integer",
              "symbols": ["a"]
            },
            "bar": {
              "type": "integer",
              "symbols": ["b"],
              "nilDecider": "abc"
            },
            "baz": {
              "type": "integer",
              "symbols": ["c"]
            },
            "qux": {
              "type": "integer",
              "symbols": ["d"],
              "nilDecider": "def"
            },
            "abc": {
              "type": "boolean",
              "symbols": ["x"]
            },
            "def": {
              "type": "boolean",
              "symbols": ["y"]
            }
          }
        };
      });

      it("encodes the nilDecider symbol to true/false", function () {
        var assignments = describedClass.encode(program, {
          arr: [[123], [456, 789]]
        });

        expect(assignments).toEqual({
          a: 123,
          c: 456,
          d: 789,
          x: true,
          y: false
        });
      });

      it("works correctly when encoding with the object syntax", function () {
        var assignments = describedClass.encode(program, {
          arr: {
            0: { 0: 123 },
            1: { 0: 456, 1: 789 }
          }
        });

        expect(assignments).toEqual({
          a: 123,
          c: 456,
          d: 789,
          x: true,
          y: false
        });
      });

      it("allows for encoding of only the nilDecider", function () {
        var assignments = describedClass.encode(program, {
          arr: { 0: { 0: 123 } },
          bar: null,
          qux: 456
        });
        expect(assignments).toEqual({
          a: 123,
          d: 456,
          x: true,
          y: false
        });
      });

      it("throws an error if the assignments contradict", function () {
        expect(function () {
          describedClass.encode(program, {
            arr: [[123, 456], [789]],
            def: false
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: [[123, 456], [789]],
            abc: true
          });
        }).toThrow();
      });

      it("decodes values as normal when 'nilDecider' is false", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: false,
          y: false
        });

        expect(results).toEqual({
          arr: [[123, 321], [456, 654]],
          arr1: [123, 321],
          arr2: [456, 654],
          foo: 123,
          bar: 321,
          baz: 456,
          qux: 654,
          abc: false,
          def: false
        });
      });

      it("decodes values as null when 'nilDecider' is true", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: true,
          y: true
        });

        expect(results).toEqual({
          arr: [[123], [456]],
          arr1: [123],
          arr2: [456],
          foo: 123,
          bar: null,
          baz: 456,
          qux: null,
          abc: true,
          def: true
        });
      });
    });

    describe("when the array itself has a 'nilDecider'", function () {
      beforeEach(function () {
        program = {
          "level3Variables": {
            "arr": {
              "type": "array",
              "symbols": ["foo", "bar"],
              "nilDecider": "baz"
            },
            "foo": {
              "type": "integer",
              "symbols": ["a"]
            },
            "bar": {
              "type": "integer",
              "symbols": ["b"]
            },
            "baz": {
              "type": "boolean",
              "symbols": ["x"]
            }
          }
        };
      });

      it("encodes the nilDecider symbol to true if null", function () {
        var assignments = describedClass.encode(program, {
          arr: null
        });
        expect(assignments).toEqual({
          x: true
        });
      });

      it("encodes the nilDecider symbol to false if not null", function () {
        var assignments = describedClass.encode(program, {
          arr: [123, 456]
        });
        expect(assignments).toEqual({
          a: 123,
          b: 456,
          x: false
        });
      });

      it("allows for encoding of only the nilDecider", function () {
        var assignments = describedClass.encode(program, {
          baz: true
        });
        expect(assignments).toEqual({
          x: true
        });
      });

      it("throws an error if the assignments contradict", function () {
        expect(function () {
          describedClass.encode(program, {
            arr: [123, 456],
            baz: true
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: null,
            baz: false
          });
        }).toThrow();
      });

      it("decodes values as normal when 'nilDecider' is false", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 456,
          x: false
        });

        expect(results).toEqual({
          arr: [123, 456],
          foo: 123,
          bar: 456,
          baz: false
        });
      });

      it("decodes values as null when 'nilDecider' is true", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 456,
          x: true
        });

        expect(results).toEqual({
          arr: null,
          foo: 123,
          bar: 456,
          baz: true
        });
      });
    });

    describe("nested arrays with 'nilDecider' set on arrays", function () {
      beforeEach(function () {
        program = {
          "level3Variables": {
            "arr": {
              "type": "array",
              "symbols": ["arr1", "arr2"],
              "nilDecider": "abc"
            },
            "arr1": {
              "type": "array",
              "symbols": ["foo", "bar"]
            },
            "arr2": {
              "type": "array",
              "symbols": ["baz", "qux"],
              "nilDecider": "def"
            },
            "foo": {
              "type": "integer",
              "symbols": ["a"]
            },
            "bar": {
              "type": "integer",
              "symbols": ["b"]
            },
            "baz": {
              "type": "integer",
              "symbols": ["c"]
            },
            "qux": {
              "type": "integer",
              "symbols": ["d"]
            },
            "abc": {
              "type": "boolean",
              "symbols": ["x"]
            },
            "def": {
              "type": "boolean",
              "symbols": ["y"]
            }
          }
        };
      });

      it("encodes the nilDecider symbol to true if null", function () {
        var assignments = describedClass.encode(program, {
          arr: null
        });
        expect(assignments).toEqual({
          x: true
        });

        assignments = describedClass.encode(program, {
          arr2: null
        });
        expect(assignments).toEqual({
          y: true
        });

        assignments = describedClass.encode(program, {
          arr: [[123, 456]]
        });
        expect(assignments).toEqual({
          a: 123,
          b: 456,
          x: false,
          y: true
        });
      });

      it("encodes the nilDecider symbol to false if not null", function () {
        var assignments = describedClass.encode(program, {
          arr: [[123, 321], [456, 654]]
        });
        expect(assignments).toEqual({
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: false,
          y: false
        });
      });

      it("allows for encoding of only the nilDecider", function () {
        var assignments = describedClass.encode(program, {
          abc: true
        });
        expect(assignments).toEqual({
          x: true
        });

        assignments = describedClass.encode(program, {
          def: true
        });
        expect(assignments).toEqual({
          y: true
        });
      });

      it("throws an error if the assignments contradict", function () {
        expect(function () {
          describedClass.encode(program, {
            arr: null,
            abc: false
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: [[123, 456]],
            abc: true
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: [[123, 456]],
            def: false
          });
        }).toThrow();

        expect(function () {
          describedClass.encode(program, {
            arr: [[123, 321], [456, 654]],
            def: true
          });
        }).toThrow();
      });

      it("decodes values as normal when 'nilDecider' is false", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: false,
          y: false
        });

        expect(results).toEqual({
          arr: [[123, 321], [456, 654]],
          arr1: [123, 321],
          arr2: [456, 654],
          foo: 123,
          bar: 321,
          baz: 456,
          qux: 654,
          abc: false,
          def: false
        });
      });

      it("decodes values as null when 'nilDecider' is true", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: true,
          y: true
        });

        expect(results).toEqual({
          arr: null,
          arr1: [123, 321],
          arr2: null,
          foo: 123,
          bar: 321,
          baz: 456,
          qux: 654,
          abc: true,
          def: true
        });
      });

      it("works as expected on opposing 'nilDecider' values", function () {
        var results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: true,
          y: false
        });

        expect(results).toEqual({
          arr: null,
          arr1: [123, 321],
          arr2: [456, 654],
          foo: 123,
          bar: 321,
          baz: 456,
          qux: 654,
          abc: true,
          def: false
        });

        results = describedClass.decode(program, {
          a: 123,
          b: 321,
          c: 456,
          d: 654,
          x: false,
          y: true
        });

        expect(results).toEqual({
          arr: [[123, 321]],
          arr1: [123, 321],
          arr2: null,
          foo: 123,
          bar: 321,
          baz: 456,
          qux: 654,
          abc: false,
          def: true
        });
      });
    });
  });
});
