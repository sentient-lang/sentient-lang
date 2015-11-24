"use strict";

var Stack = function () {
  var self = this;
  var array = [];

  self.push = function (symbol) {
    array.push(symbol);
  };

  self.pop = function () {
    var symbol = array.pop();

    if (typeof symbol === "undefined") {
      throw new Error("Cannot pop from an empty stack");
    }

    return symbol;
  };
};

module.exports = Stack;
