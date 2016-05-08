"use strict";

var Sentient = require("../../../../lib/sentient");

describe("recursive calls to functions", function () {
  var timeInMilliseconds = function () {
    return new Date().getTime();
  };

  it("exceeds the call stack within 2 seconds", function () {
    var before = timeInMilliseconds();

    expect(function () {
      Sentient.compile("function foo () { a = [1, 2, 3]; foo(); }; foo();");
    }).toThrow();

    var after = timeInMilliseconds();
    var timeTaken = after - before;

    expect(timeTaken).toBeLessThan(2000);
  });
});
