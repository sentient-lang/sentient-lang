"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");

module.exports.compile = function (program) {
  return Compiler.compile(program);
};

module.exports.run = function (program, assignments, count, callback, adapter) {
  return Runtime.run(program, assignments, count, callback, adapter);
};

if (typeof window !== "undefined") {
  window.Sentient = module.exports;
}
