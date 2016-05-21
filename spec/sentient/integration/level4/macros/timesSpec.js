"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("macro: times", function () {
  it("calls the function for each constant", function () {
    var program = Sentient.compile("\n\
      array3<int> numbers;          \n\
                                    \n\
      times(3, function^ (i) {      \n\
        invariant numbers[i] == i;  \n\
      });                           \n\
                                    \n\
      expose numbers;               \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ numbers: [0, 1, 2] }]);
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("\n\
      array3<int> numbers;          \n\
                                    \n\
      3.times(function^ (i) {       \n\
        invariant numbers[i] == i;  \n\
      });                           \n\
                                    \n\
      expose numbers;               \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual([{ numbers: [0, 1, 2] }]);
  });
});
