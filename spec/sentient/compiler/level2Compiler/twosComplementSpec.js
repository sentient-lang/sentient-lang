"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level2Compiler/twosComplement");

describe("TwosComplement", function () {
  it("encodes integers to twos-complement bit arrays", function () {
    expect(describedClass.encode(7)).toEqual([false, true, true, true]);
    expect(describedClass.encode(6)).toEqual([false, true, true, false]);
    expect(describedClass.encode(5)).toEqual([false, true, false, true]);
    expect(describedClass.encode(4)).toEqual([false, true, false, false]);
    expect(describedClass.encode(3)).toEqual([false, true, true]);
    expect(describedClass.encode(2)).toEqual([false, true, false]);
    expect(describedClass.encode(1)).toEqual([false, true]);
    expect(describedClass.encode(0)).toEqual([false]);
    expect(describedClass.encode(-1)).toEqual([true]);
    expect(describedClass.encode(-2)).toEqual([true, false]);
    expect(describedClass.encode(-3)).toEqual([true, false, true]);
    expect(describedClass.encode(-4)).toEqual([true, false, false]);
    expect(describedClass.encode(-5)).toEqual([true, false, true, true]);
    expect(describedClass.encode(-6)).toEqual([true, false, true, false]);
    expect(describedClass.encode(-7)).toEqual([true, false, false, true]);
    expect(describedClass.encode(-8)).toEqual([true, false, false, false]);
  });

  it("decodes twos-complement bit arrays to integers", function () {
    expect(describedClass.decode([false, true, true, true])).toEqual((7));
    expect(describedClass.decode([false, true, true, false])).toEqual((6));
    expect(describedClass.decode([false, true, false, true])).toEqual((5));
    expect(describedClass.decode([false, true, false, false])).toEqual((4));
    expect(describedClass.decode([false, true, true])).toEqual((3));
    expect(describedClass.decode([false, true, false])).toEqual((2));
    expect(describedClass.decode([false, true])).toEqual((1));
    expect(describedClass.decode([false])).toEqual((0));
    expect(describedClass.decode([true])).toEqual((-1));
    expect(describedClass.decode([true, false])).toEqual((-2));
    expect(describedClass.decode([true, false, true])).toEqual((-3));
    expect(describedClass.decode([true, false, false])).toEqual((-4));
    expect(describedClass.decode([true, false, true, true])).toEqual((-5));
    expect(describedClass.decode([true, false, true, false])).toEqual((-6));
    expect(describedClass.decode([true, false, false, true])).toEqual((-7));
    expect(describedClass.decode([true, false, false, false])).toEqual((-8));
  });
});
