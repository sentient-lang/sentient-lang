"use strict";

var Sentient = require("../../lib/sentient");

describe("Exercise 4", function () {
  var machineCode = Sentient.compile({
    instructions: [
      // Add your instructions here.
    ]
  });

  it("can find an array that is a palindrome of 3 numbers", function () {
    var result = Sentient.run(machineCode, {});

    var palindrome = result.palindrome;
    var reverse = palindrome.slice(0).reverse();

    expect(palindrome).toEqual(reverse);
  });

  it("can find a solution that starts with a 5", function () {
    var result = Sentient.run(machineCode, { palindrome: { 0: 5 } });
    var palindrome = result.palindrome;

    expect(palindrome[0]).toEqual(5);
    expect(palindrome[2]).toEqual(5);
  });

  it("finds no solution that starts with 5 and ends with 3", function () {
    var result = Sentient.run(machineCode, { palindrome: { 0: 5, 2: 3 } });

    expect(result).toEqual({});
  });

  it("only finds solutions that multiply to equal a given number", function () {
    var result = Sentient.run(machineCode, { total: 300 });
    var palindrome = result.palindrome;
    expect(palindrome[0] * palindrome[1] * palindrome[2]).toEqual(300);

    result = Sentient.run(machineCode, { total: -120 });
    palindrome = result.palindrome;
    expect(palindrome[0] * palindrome[1] * palindrome[2]).toEqual(-120);
  });
});
