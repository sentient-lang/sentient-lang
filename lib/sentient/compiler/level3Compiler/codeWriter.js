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

  self.variable = function (symbol, type, symbols, supporting, nilDecider) {
    var existing = variables[symbol];

    if (existing && !existing.supporting) {
      supporting = false;
    }

    variables[symbol] = { type: type, symbols: symbols };

    if (supporting) {
      variables[symbol].supporting = true;
    }

    if (nilDecider) {
      variables[symbol].nilDecider = nilDecider;
    }
  };

  self.write = function () {
    metadata.level3Variables = variables;

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
