"use strict";

var describedClass = require("../../lib/sentient/stack");

describe("Stack", function () {
  var subject;

  beforeEach(function () {
    subject = new describedClass();
  });

  it("behaves as expected", function () {
    subject.push("foo");
    subject.push("bar");

    expect(subject.pop()).toEqual("bar");
    expect(subject.pop()).toEqual("foo");

    expect(function () {
      subject.pop();
    }).toThrow();
  });
});
