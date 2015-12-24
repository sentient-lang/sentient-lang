"use strict";

var Compiler = function (input) {
  var self = this;

  self.compile = function () {
    input(); // TODO
  };
};

Compiler.compile = function (input) {
  return new Compiler(input).compile();
};

module.exports = Compiler;
