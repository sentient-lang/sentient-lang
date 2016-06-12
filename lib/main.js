"use strict";

var Optimiser = require("./sentient/optimiser");
var CLI = require("./sentient/cli");

module.exports = require("./sentient");

module.exports.optimise = function (program) {
  return Optimiser.optimise(program);
};

module.exports.cli = function () {
  return CLI.run();
};
