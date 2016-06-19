"use strict";

var Compiler = require("./sentient/compiler");
var Runtime = require("./sentient/runtime");
var Logger = require("./sentient/logger");
var Source = require("./sentient/source");
var Exposed = require("./sentient/exposed");

var captureErrors = function (callback) {
  try {
    return callback();
  } catch (error) {
    Logger.error(error);
    throw error;
  }
};

module.exports.compile = function (program, callback) {
  return captureErrors(function () {
    return Compiler.compile(program, callback);
  });
};

module.exports.run = function (program, assignments, count, callback, adapter) {
  return captureErrors(function () {
    return Runtime.run(program, assignments, count, callback, adapter);
  });
};

module.exports.source = function (program) {
  return Source.retrieve(program);
};

module.exports.exposed = function (program) {
  return Exposed.retrieve(program);
};

module.exports.optimise = function () {
  Logger.error("This feature is not available in a web browser.");
};

module.exports.cli = function () {
  Logger.error("This feature is not available in a web browser.");
};

module.exports.logger = Logger;

module.exports.info = require("../package.json");
