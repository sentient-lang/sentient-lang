"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level4Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextSymbol()).toEqual("$$$_L4_TMP1_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L4_TMP2_$$$");
    expect(subject.nextSymbol()).toEqual("$$$_L4_TMP3_$$$");

    expect(subject.nextAnonymous()).toEqual("1");
    expect(subject.nextAnonymous()).toEqual("2");
    expect(subject.nextAnonymous()).toEqual("3");
  });

  describe("when a namespace is provided", function () {
    beforeEach(function () {
      subject = new describedClass("foo");
    });

    it("appends the namespace to calls", function () {
      expect(subject.nextSymbol()).toEqual("$$$_L4_TMP1foo_$$$");
      expect(subject.nextSymbol()).toEqual("$$$_L4_TMP2foo_$$$");
      expect(subject.nextSymbol()).toEqual("$$$_L4_TMP3foo_$$$");

      expect(subject.nextAnonymous()).toEqual("1foo");
      expect(subject.nextAnonymous()).toEqual("2foo");
      expect(subject.nextAnonymous()).toEqual("3foo");
    });
  });
});
