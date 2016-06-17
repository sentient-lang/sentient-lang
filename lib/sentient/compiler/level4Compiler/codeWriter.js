"use strict";

var CodeWriter = function (callbackObject) {
  var self = this;
  var instructions = [];

  self.callbackObject = callbackObject;
  self.instruction = function (object) {
    if (callbackObject) {
      callbackObject.call(object);
    } else {
      instructions.push(object);
    }
  };

  self.write = function () {
    if (callbackObject) {
      callbackObject.write();
    } else {
      return { instructions: instructions };
    }
  };
};

module.exports = CodeWriter;
