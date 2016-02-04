"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level1Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextLiteral()).toEqual(1);
    expect(subject.nextLiteral()).toEqual(2);
    expect(subject.nextLiteral()).toEqual(3);

    expect(subject.nextSymbol()).toEqual("$$$_L1_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L1_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L1_TMP3_$$$");

    expect(subject.trueSymbol()).toEqual("$$$_L1_TRUE_$$$");
    expect(subject.falseSymbol()).toEqual("$$$_L1_FALSE_$$$");
  });
});
