"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextSymbol()).toEqual("$$$_L3_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L3_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L3_TMP3_$$$");

    expect(subject.nextBoolean()).toEqual(["$$$_L3_BOOLEAN1_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_L3_BOOLEAN2_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_L3_BOOLEAN3_$$$"]);

    expect(subject.nextInteger()).toEqual(["$$$_L3_INTEGER1_$$$"]);
    expect(subject.nextInteger()).toEqual(["$$$_L3_INTEGER2_$$$"]);
    expect(subject.nextInteger()).toEqual(["$$$_L3_INTEGER3_$$$"]);
  });
});
