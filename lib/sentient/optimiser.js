"use strict";

var Optimiser = function (machineCode) {
  var self = this;

  var CoprocessorAdapter = require("./optimiser/coprocessorAdapter");

  self.optimise = function () {
    return CoprocessorAdapter.optimise(machineCode);
  };
};

Optimiser.optimise = function (machineCode) {
  return new Optimiser(machineCode).optimise();
};

module.exports = Optimiser;
