"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L3_";
  var suffix = "_$$$";

  var symbolNumber = 0;
  var booleanNumber = 0;
  var integerNumber = 0;
  var arrayNumber = 0;
  var functionNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };

  self.nextBoolean = function () {
    booleanNumber += 1;
    return [prefix + "BOOLEAN" + booleanNumber + suffix];
  };

  self.nextInteger = function () {
    integerNumber += 1;
    return [prefix + "INTEGER" + integerNumber + suffix];
  };

  self.nextArray = function (width) {
    if (!width) {
      throw new Error("No width specified");
    }

    arrayNumber += 1;

    var symbols = [];
    for (var i = 0; i < width; i += 1) {
      symbols.push(prefix + "ARRAY" + arrayNumber + "_ELEMENT" + i + suffix);
    }
    return symbols;
  };

  self.nextFunction = function () {
    functionNumber += 1;
    return functionNumber;
  };
};

module.exports = Registry;
