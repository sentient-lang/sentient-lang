"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L2_";
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
    if (!width) {
      throw new Error("No width specified");
    }

    integerNumber += 1;

    var symbols = [];
    for (var i = 0; i < width; i += 1) {
      symbols.push(prefix + "INTEGER" + integerNumber + "_BIT" + i + suffix);
    }
    return symbols;
  };
};

module.exports = Registry;
