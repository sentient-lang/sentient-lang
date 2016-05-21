"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");

module.exports.compile = function (program) {
  return Compiler.compile(program);
};

module.exports.run = function (program, assignments, count, adapterName) {
  return Runtime.run(program, assignments, count, adapterName);
};

if (typeof window !== "undefined") {
  window.Sentient = module.exports;
}
