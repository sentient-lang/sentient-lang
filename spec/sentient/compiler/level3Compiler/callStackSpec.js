"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/callStack");

describe("CallStack", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("throws an error when a duplicate is added", function () {
    subject = subject.add(1, "foo");
    subject = subject.add(2, "bar");

    expect(function () {
      subject = subject.add(2, "bar");
    }).toThrow();
  });

  it("determines duplicates based on id, not by name", function () {
    expect(function () {
      subject = subject.add(1, "foo");
      subject = subject.add(2, "foo");
      subject = subject.add(3, "foo");
    }).not.toThrow();
  });

  it("prints an ascii representation of a stack", function () {
    subject = subject.add(1, "a");
    subject = subject.add(3, "bb");
    subject = subject.add(5, "ccc");
    subject = subject.add(7, "dddd");

    var expected = "| dddd (id=7) |";
    expected +=  "\n| ccc (id=5)  |";
    expected +=  "\n| bb (id=3)   |";
    expected +=  "\n| a (id=1)    |";
    expected +=  "\n---------------";

    expect(subject.toString()).toEqual(expected);
  });
});
