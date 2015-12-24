"use strict";

var _ = require("underscore");

var CodeWriter = function () {
  var self = this;
  var instructions = [];

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.write = function () {
    var output = {};

    output.instructions = instructions;

    return output;
  };
};

module.exports = CodeWriter;
