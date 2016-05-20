"use strict";

var Sentient = require("../../../../../lib/sentient");

describe("macro: downto", function () {
  it("calls the function for each constant", function () {
    var program = Sentient.compile("\n\
      total = 0;                    \n\
                                    \n\
      downto(4, 2, function^ (i) {  \n\
        total += i;                 \n\
      });                           \n\
                                    \n\
      expose total;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ total: 9 });
  });

  it("works with negative numbers", function () {
    var program = Sentient.compile("\n\
      total = 0;                    \n\
                                    \n\
      downto(-1, -3, function^ (i) {\n\
        total += i;                 \n\
      });                           \n\
                                    \n\
      expose total;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ total: -6 });
  });

  it("can be called as a method instead of a function", function () {
    var program = Sentient.compile("\n\
      total = 0;                    \n\
                                    \n\
      4.downto(2, function^ (i) {   \n\
        total += i;                 \n\
      });                           \n\
                                    \n\
      expose total;                 \n\
    ");
    var result = Sentient.run(program);

    expect(result).toEqual({ total: 9 });
  });
});
