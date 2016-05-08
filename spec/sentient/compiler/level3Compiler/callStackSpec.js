"use strict";

var compiler = "../../../../lib/sentient/compiler";
var describedClass = require(compiler + "/level3Compiler/callStack");

describe("CallStack", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
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

  it("throws if the stack size is greater than 1000", function () {
    for (var i = 0; i < 1000; i += 1) {
      subject = subject.add(i, "call " + i);
    }

    expect(function () {
      subject.add(1000, "call 1000");
    }).toThrow();
  });

  it("truncates the call stack to the most recent 20 lines", function () {
    for (var i = 1; i <= 21; i += 1) {
      subject = subject.add(i, "call " + i);
    }

    var result = subject.toString();

    expect(result).toMatch("call 21 ");
    expect(result).toMatch("call 2 ");
    expect(result).toMatch("(truncated)");
    expect(result).not.toMatch("call 1 ");
  });

  it("does not include '(truncated)' if not truncated", function () {
    for (var i = 1; i <= 20; i += 1) {
      subject = subject.add(i, "call " + i);
    }

    expect(subject.toString()).not.toMatch("(truncated)");
  });
});
