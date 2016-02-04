"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L1_";
  var suffix = "_$$$";

  var literalNumber = 0;
  var symbolNumber = 0;

  self.nextLiteral = function () {
    literalNumber += 1;
    return literalNumber;
  };

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.trueSymbol = function () {
    return prefix + "TRUE" + suffix;
  };

  self.falseSymbol = function () {
    return prefix + "FALSE" + suffix;
  };
};

module.exports = Registry;
