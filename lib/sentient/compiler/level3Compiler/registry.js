"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L3_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var booleanNumber = 0;
  var integerNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextBoolean = function () {
    booleanNumber += 1;
    return [prefix + "BOOLEAN" + booleanNumber + suffix];
  };

  self.nextInteger = function (width) {
    integerNumber += 1;
    return [prefix + "INTEGER" + integerNumber + suffix];
  };
};

module.exports = Registry;
