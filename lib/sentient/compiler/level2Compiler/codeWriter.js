"use strict";

var CodeWriter = function (callbackObject) {
  var self = this;
  var instructions = [];
  var metadata = {};
  var variables = {};

  self.instruction = function (object) {
    if (callbackObject) {
      callbackObject.call(object);
    } else {
      instructions.push(object);
    }
  };

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, type, symbols) {
    variables[symbol] = { type: type, symbols: symbols };
  };

  self.write = function () {
    metadata.level2Variables = variables;

    if (callbackObject) {
      callbackObject.metadata(metadata);
      callbackObject.write();
    } else {
      var output = {};

      output.instructions = instructions;
      output.metadata = metadata;

      return output;
    }
  };
};

module.exports = CodeWriter;
