"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level2Compiler/registry");

describe("Registry", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN1_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN2_$$$"]);
    expect(subject.nextBoolean()).toEqual(["$$$_BOOLEAN3_$$$"]);
  });
});
