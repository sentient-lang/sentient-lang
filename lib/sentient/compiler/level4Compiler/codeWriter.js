"use strict";

var CodeWriter = function (callbackObject) {
  var self = this;
  var instructions = [];
  var metadata = {};

  self.callbackObject = callbackObject;
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

  self.write = function () {
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
