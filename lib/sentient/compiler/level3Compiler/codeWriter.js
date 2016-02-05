"use strict";

var CodeWriter = function () {
  var self = this;
  var instructions = [];
  var metadata = {};
  var variables = {};

  self.instruction = function (object) {
    instructions.push(object);
  };

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, type, symbols) {
    variables[symbol] = { type: type, symbols: symbols };
  };

  self.write = function () {
    var output = {};

    output.instructions = instructions;
    output.metadata = metadata;
    output.metadata.level3Variables = variables;

    return output;
  };
};

module.exports = CodeWriter;
