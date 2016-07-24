"use strict";

var compiler = "../../../../lib/sentient/compiler";
var combinations = require(compiler + "/level3Compiler/combinations");

describe("combinations", function () {
  it("generates combinations of 1", function () {
    expect(combinations(0, 1)).toEqual([]);
    expect(combinations(1, 1)).toEqual([[0]]);
    expect(combinations(2, 1)).toEqual([[0], [1]]);
    expect(combinations(3, 1)).toEqual([[0], [1], [2]]);
    expect(combinations(4, 1)).toEqual([[0], [1], [2], [3]]);
  });

  it("generates combinations of 2", function () {
    expect(combinations(0, 2)).toEqual([]);
    expect(combinations(1, 2)).toEqual([]);
    expect(combinations(2, 2)).toEqual([[0, 1]]);
    expect(combinations(3, 2)).toEqual([[0, 1], [0, 2], [1, 2]]);
    expect(combinations(4, 2)).toEqual([
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]
    ]);
  });

  it("generates combinations of 3", function () {
    expect(combinations(0, 3)).toEqual([]);
    expect(combinations(1, 3)).toEqual([]);
    expect(combinations(2, 3)).toEqual([]);
    expect(combinations(3, 3)).toEqual([[0, 1, 2]]);
    expect(combinations(4, 3)).toEqual([
      [0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]
    ]);
  });
});
