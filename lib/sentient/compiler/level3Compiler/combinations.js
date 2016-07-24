"use strict";

var combinations = function (start, stop, c) {
  if (c === 0) {
    return [[]];
  } else {
    var accumulator = [];

    for (var i = start; i < stop; i += 1) {
      var subcombinations = combinations(i + 1, stop, c - 1);

      for (var j = 0; j < subcombinations.length; j += 1) {
        var subcombination = subcombinations[j];
        subcombination.unshift(i);
        accumulator.push(subcombination);
      }
    }

    return accumulator;
  }
};

module.exports = function (n, c) {
  return combinations(0, n, c);
};
