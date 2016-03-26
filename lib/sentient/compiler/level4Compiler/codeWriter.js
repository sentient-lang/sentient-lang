"use strict";

var CodeWriter = function () {
  var self = this;
  var instructions = [];

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.write = function () {
    return { instructions: instructions };
  };
};

module.exports = CodeWriter;
