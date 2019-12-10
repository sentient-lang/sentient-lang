"use strict";

var describedClass = require("../../lib/sentient/exposed");
var Sentient = require("../../lib/sentient");

describe("Exposed", function () {
  describe("when the variable is explicitly declared", function () {
    it("retrieves information about integers", function () {
      var program = Sentient.compile("int a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "integer",
          minimum: -128,
          maximum: 127
        }
      });
    });

    it("retrieves information about booleans", function () {
      var program = Sentient.compile("bool a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "boolean"
        }
      });
    });

    it("retrieves information about integer arrays", function () {
      var program = Sentient.compile("array2<int> a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "array",
          width: 2,
          elements: [
            {
              type: "integer",
              minimum: -128,
              maximum: 127
            },
            {
              type: "integer",
              minimum: -128,
              maximum: 127
            }
          ]
        }
      });
    });

    it("retrieves information about boolean arrays", function () {
      var program = Sentient.compile("array3<bool> a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "array",
          width: 3,
          elements: [
            { type: "boolean" },
            { type: "boolean" },
            { type: "boolean" }
          ]
        }
      });
    });

    it("retrieves information about arrays of arrays", function () {
      var program = Sentient.compile("array1<array1<bool>> a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "array",
          width: 1,
          elements: [
            {
              type: "array",
              width: 1,
              elements: [
                { type: "boolean" }
              ]
            }
          ]
        }
      });
    });
  });

  describe("when the variable is implicitly declared", function () {
    it("retrieves information about integers", function () {
      var program = Sentient.compile("a = 1000; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "integer",
          minimum: -1024,
          maximum: 1023
        }
      });
    });

    it("retrieves information about booleans", function () {
      var program = Sentient.compile("a = false; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "boolean"
        }
      });
    });

    it("retrieves information about integer arrays", function () {
      var program = Sentient.compile("a = [1, 2]; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "array",
          width: 2,
          elements: [
            {
              type: "integer",
              minimum: -2,
              maximum: 1
            },
            {
              type: "integer",
              minimum: -4,
              maximum: 3
            }
          ]
        }
      });
    });

    it("retrieves information about boolean arrays", function () {
      var program = Sentient.compile("array3<bool> a; expose a;");
      var result = describedClass.retrieve(program);

      expect(result).toEqual({
        a: {
          type: "array",
          width: 3,
          elements: [
            { type: "boolean" },
            { type: "boolean" },
            { type: "boolean" }
          ]
        }
      });
    });
  });

  it("coerces input to JSON if it is a string", function () {
    var program = Sentient.compile("int a; expose a;");
    program = JSON.stringify(program);
    var result = describedClass.retrieve(program);

    expect(result).toEqual({
      a: {
        type: "integer",
        minimum: -128,
        maximum: 127
      }
    });
  });

  it("retrieves information about arrays of arrays", function () {
    var program = Sentient.compile("a = [[10], [20, 30]]; expose a;");
    var result = describedClass.retrieve(program);

    expect(result).toEqual({
      a: {
        type: "array",
        width: 2,
        elements: [
          {
            type: "array",
            width: 1,
            elements: [
              {
                type: "integer",
                minimum: -16,
                maximum: 15
              }
            ]
          },
          {
            type: "array",
            width: 2,
            elements: [
              {
                type: "integer",
                minimum: -32,
                maximum: 31
              },
              {
                type: "integer",
                minimum: -32,
                maximum: 31
              }
            ]
          }
        ]
      }
    });
  });

  it("indicates that values might not be returned (maybe monad)", function () {
    var program = Sentient.compile("\n\
      index = 0;                    \n\
      arr = [[10], [20, 30]];       \n\
      a = arr.get(index);           \n\
      expose a;                     \n\
    ");

    var result = describedClass.retrieve(program);

    expect(result).toEqual({
      a: {
        type: "array",
        width: 2,
        elements: [
          {
            type: "integer",
            maybe: true,
            minimum: -32,
            maximum: 31
          },
          {
            type: "integer",
            maybe: true,
            minimum: -32,
            maximum: 31
          }
        ]
      }
    });
  });

  it("works for a complicated example", function () {
    var program = Sentient.compile("\n\
      a = true;                     \n\
      b = false;                    \n\
      arr = [[a], [b]];             \n\
      index = 0;                    \n\
      x = arr[index];               \n\
      expose a, b, arr, index, x;   \n\
    ");

    var result = describedClass.retrieve(program);

    expect(result).toEqual({
      a: {
        type: "boolean"
      },
      b: {
        type: "boolean"
      },
      arr: {
        type: "array",
        width: 2,
        elements: [
          {
            type: "array",
            width: 1,
            elements: [
              { type: "boolean" }
            ]
          },
          {
            type: "array",
            width: 1,
            elements: [
              { type: "boolean" }
            ]
          }
        ]
      },
      index: {
        type: "integer",
        minimum: -1,
        maximum: 0
      },
      x: {
        type: "array",
        width: 1,
        elements: [
          {
            type: "boolean",
            maybe: true
          }
        ]
      }
    });
  });
});
