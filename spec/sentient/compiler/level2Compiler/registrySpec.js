"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level2Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextSymbol()).toEqual("$$$_L2_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L2_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L2_TMP3_$$$");

    expect(subject.nextBoolean()).toEqual(["$$$_L2_BOOLEAN1_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_L2_BOOLEAN2_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_L2_BOOLEAN3_$$$"]);

    expect(subject.nextInteger(1)).toEqual(["$$$_L2_INTEGER1_BIT0_$$$"]);
    expect(subject.nextInteger(2)).toEqual([
      "$$$_L2_INTEGER2_BIT0_$$$",
      "$$$_L2_INTEGER2_BIT1_$$$"
    ]);

    expect(function () {
      subject.nextInteger();
    }).toThrow();
  });
});
