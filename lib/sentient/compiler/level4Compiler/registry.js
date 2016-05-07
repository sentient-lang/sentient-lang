"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L4_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var anonymousNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextAnonymous = function () {
    anonymousNumber += 1;
    return anonymousNumber;
  };
};

module.exports = Registry;
