"use strict";

var Optimiser = require("./sentient/optimiser");
var CLI = require("./sentient/cli");

module.exports = require("./sentient");

var captureErrors = function (callback) {
  try {
    return callback();
  } catch (error) {
    module.exports.logger.error(error);
    throw error;
  }
};

module.exports.optimise = function (program) {
  return captureErrors(function () {
    return Optimiser.optimise(program);
  });
};

module.exports.cli = function () {
  return captureErrors(function () {
    return CLI.run();
  });
};
