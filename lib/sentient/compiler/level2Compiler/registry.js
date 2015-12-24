"use strict";

var Registry = function () {
  var self = this;

  var booleanNumber = 0;
  var integerNumber = 0;

  self.nextBoolean = function () {
    booleanNumber += 1;
    return ["$$$_BOOLEAN" + booleanNumber + "_$$$"];
  };

  self.nextInteger = function (width) {
    integerNumber += 1;

    var symbols = [];
    for (var i = 0; i < width; i += 1) {
      symbols.push("$$$_INTEGER" + integerNumber + "_BIT" + i + "_$$$");
    }
    return symbols;
  };
};

module.exports = Registry;
