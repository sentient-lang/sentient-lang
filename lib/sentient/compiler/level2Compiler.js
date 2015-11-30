"use strict";

var Compiler = function (input) {
  var self = this;

  self.compile = function () {

  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;
