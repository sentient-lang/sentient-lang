"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level2Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextSymbol()).toEqual("$$$_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_TMP3_$$$");

    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN1_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN2_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN3_$$$"]);

    expect(subject.nextInteger(1)).toEqual(["$$$_INTEGER1_BIT0_$$$"]);
    expect(subject.nextInteger(2)).toEqual([
      "$$$_INTEGER2_BIT0_$$$",
      "$$$_INTEGER2_BIT1_$$$"
    ]);

    expect(function () {
      subject.nextInteger();
    }).toThrow();
  });
});
