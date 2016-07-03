"use strict";

var Registry = function (namespace) {
  var self = this;
  var prefix = "$$$_L4_";
  var suffix = "_$$$";

  namespace = namespace || "";

  var symbolNumber = 0;
  var anonymousNumber = 0;

  self.nextSymbol = function () {
    symbolNumber += 1;
    return prefix + "TMP" + symbolNumber + namespace + suffix;
  };

  self.nextAnonymous = function () {
    anonymousNumber += 1;
    return anonymousNumber + namespace;
  };
};

module.exports = Registry;
