"use strict";

var Registry = function () {
  var self = this;

  var literalNumber = 0;
  var symbolNumber = 0;

  self.nextLiteral = function () {
    literalNumber += 1;
    return literalNumber;
  };

  self.nextSymbol = function () {
    symbolNumber += 1;
    return "$$$_TMP" + symbolNumber + "_$$$";
  };
};

module.exports = Registry;
