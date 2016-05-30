"use strict";

var CoprocessorAdapter = require("./optimiser/coprocessorAdapter");

var Optimiser = function (machineCode) {
  var self = this;

  self.optimise = function () {
    return CoprocessorAdapter.optimise(machineCode);
  };
};

Optimiser.optimise = function (machineCode) {
  return new Optimiser(machineCode).optimise();
};

module.exports = Optimiser;
