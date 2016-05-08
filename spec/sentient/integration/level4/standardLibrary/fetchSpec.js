"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("standard library: []", function () {
  it("fetches elements from an integer array", function () {
    var program = Sentient.compile("\n\
      array = [1, 2, 3];            \n\
                                    \n\
      a = array[0];                 \n\
      b = array[1];                 \n\
      c = array[2];                 \n\
                                    \n\
      vary a, b, c;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it("fetches elements from a boolean array", function () {
    var program = Sentient.compile("\n\
      array = [true, false];        \n\
                                    \n\
      a = array[0];                 \n\
      b = array[1];                 \n\
                                    \n\
      vary a, b;                    \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: true, b: false });
  });

  it("fetches elements from nested arrays", function () {
    var program = Sentient.compile("\n\
      array = [[10], [20, 30]];     \n\
                                    \n\
      a = array[0][0];              \n\
      b = array[1][0];              \n\
      c = array[1][1];              \n\
                                    \n\
      vary a, b, c;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ a: 10, b: 20, c: 30 });
  });

  it("returns no solution if index is out-of-bounds", function () {
    var program = Sentient.compile("a = [1, 2, 3][-1]; vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({});

    program = Sentient.compile("a = [1, 2, 3][3]; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({});

    program = Sentient.compile("a = [[10], [20, 30]][0][1]; vary a;");
    result = Sentient.run(program);
    expect(result).toEqual({});
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("a = []([1, 2, 3], 1); vary a;");
    var result = Sentient.run(program);
    expect(result).toEqual({ a: 2 });
  });
});
