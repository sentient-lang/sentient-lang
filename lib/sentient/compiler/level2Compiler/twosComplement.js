"use strict";

var _ = require("underscore");

var TwosComplement = {};

TwosComplement.encode = function (n) {
  var binary, array;

  if (n < 0) {
    binary = Number(Math.abs(n + 1)).toString(2);

    array = _.map(binary, function (bit) {
      return bit === "0";
    });

    if (array[0] !== true) {
      array.unshift(true);
    }
  } else {
    binary = Number(n).toString(2);

    array = _.map(binary, function (bit) {
      return bit === "1";
    });

    if (array[0] !== false) {
      array.unshift(false);
    }
  }

  return array;
};

TwosComplement.decode = function (array) {
  var total = 0;

  _.each(array, function (bit, index) {
    if (bit) {
      total += Math.pow(2, array.length - index - 1);
    }

    if (index === 0) {
      total = -total;
    }
  });

  if (total === -0) {
    total = 0;
  }

  return total;
};

module.exports = TwosComplement;
