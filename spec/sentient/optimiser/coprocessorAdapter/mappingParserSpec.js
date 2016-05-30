"use strict";

var optimiser = "../../../../lib/sentient/optimiser";
var describedClass = require(optimiser + "/coprocessorAdapter/mappingParser");

describe("MappingParser", function () {
  it("does not include mappings where the number is 1", function () {
    expect(describedClass.parse("\n1 0\n")).toEqual({});
    expect(describedClass.parse("\n1 1 0\n")).toEqual({});
    expect(describedClass.parse("\n1 1 1 0\n")).toEqual({});
    expect(describedClass.parse("\n1 1 1 1 0\n")).toEqual({});
  });

  it("does not include mappings that match the index + 2", function () {
    expect(describedClass.parse("\n2 0\n")).toEqual({});
    expect(describedClass.parse("\n2 3 0\n")).toEqual({});
    expect(describedClass.parse("\n2 3 4 0\n")).toEqual({});
    expect(describedClass.parse("\n2 3 4 5 0\n")).toEqual({});
    expect(describedClass.parse("\n1 3 1 1 0\n")).toEqual({});
  });

  it("maps (number - 1) => (index + 1)", function () {
    expect(describedClass.parse("\n3 0\n")).toEqual({ 2: 1 });
    expect(describedClass.parse("\n4 0\n")).toEqual({ 3: 1 });
    expect(describedClass.parse("\n4 5 0\n")).toEqual({ 3: 1, 4: 2 });
    expect(describedClass.parse("\n3 1 0\n")).toEqual({ 2: 1 });
    expect(describedClass.parse("\n3 2 0\n")).toEqual({ 2: 1, 1: 2 });
    expect(describedClass.parse("\n3 3 0\n")).toEqual({ 2: 1 });
  });

  it("stops parsing after reaching a 1", function () {
    expect(describedClass.parse("\n1 9 0\n")).toEqual({});
    expect(describedClass.parse("\n3 1 5 0\n")).toEqual({ 2: 1 });
    expect(describedClass.parse("\n3 5 1 9 0\n")).toEqual({ 2: 1, 4: 2 });
  });

  it("returns an empty object on an empty input", function () {
    expect(describedClass.parse("")).toEqual({});
  });
});
