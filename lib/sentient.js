"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");
var Logger = require("./sentient/logger");

module.exports.compile = function (program, callback) {
  return Compiler.compile(program, callback);
};

module.exports.run = function (program, assignments, count, callback, adapter) {
  return Runtime.run(program, assignments, count, callback, adapter);
};

module.exports.logger = Logger;

module.exports.info = require("../package.json");
