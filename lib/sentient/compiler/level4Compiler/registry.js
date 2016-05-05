"use strict";

var Registry = function () {
  var self = this;
  var prefix = "$$$_L4_";
  var suffix = "_$$$";

  var symbolNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + suffix;
  };
};

module.exports = Registry;
