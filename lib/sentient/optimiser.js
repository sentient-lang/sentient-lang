"use strict";

var _ = require("underscore");

var Optimiser = function (machineCode) {
  var self = this;

  var CoprocessorAdapter = require("./optimiser/coprocessorAdapter");

  self.optimise = function () {
    if (typeof machineCode === "string") {
      machineCode = JSON.parse(machineCode);
    } else {
      machineCode = _.clone(machineCode);
    }

    return CoprocessorAdapter.optimise(machineCode);
  };
};

Optimiser.optimise = function (machineCode) {
  return new Optimiser(machineCode).optimise();
};

module.exports = Optimiser;
