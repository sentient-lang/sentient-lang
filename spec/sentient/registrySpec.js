"use strict";

var describedClass = require("../../lib/sentient/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextLiteral()).toEqual(1);
    expect(subject.nextLiteral()).toEqual(2);
    expect(subject.nextLiteral()).toEqual(3);

    expect(subject.nextSymbol()).toEqual("$$$_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_TMP3_$$$");

    expect(subject.trueSymbol()).toEqual("$$$_TRUE_$$$");
    expect(subject.falseSymbol()).toEqual("$$$_FALSE_$$$");
  });
});
