"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");
var fs = require("fs");

module.exports.compile = function (program) {
  return Compiler.compile(program);
};

module.exports.run = function (program, assignments, count, callback, adapter) {
  return Runtime.run(program, assignments, count, callback, adapter);
};

module.exports.info = JSON.parse(
  fs.readFileSync(__dirname + "/../package.json", "utf8")
);
