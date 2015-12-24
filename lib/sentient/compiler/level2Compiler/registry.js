"use strict";

var Registry = function () {
  var self = this;

  var booleanNumber = 0;

  self.nextBoolean = function () {
    booleanNumber += 1;
    return ["$$$_BOOLEAN" + booleanNumber + "_$$$"];
  };
};

module.exports = Registry;
