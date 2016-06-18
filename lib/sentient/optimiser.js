"use strict";

var Logger = require("./logger");
var _ = require("underscore");

var Optimiser = function (machineCode) {
  var self = this;

  var CoprocessorAdapter = require("./optimiser/coprocessorAdapter");

  self.optimise = function () {
    if (typeof machineCode === "string") {
      Logger.info("Parsing machine code...");
      machineCode = JSON.parse(machineCode);
    } else {
      machineCode = _.clone(machineCode);
    }

    Logger.info("Optimising machine code...");

    var previousLength = machineCode.dimacs.length;
    var optimisedCode = CoprocessorAdapter.optimise(machineCode);
    var optimisedLength = optimisedCode.dimacs.length;

    Logger.info("Finished optimising");

    Logger.debug("Previous characters: " + previousLength);
    Logger.debug("Optimised characters: " + optimisedLength);

    var compression = (optimisedLength / previousLength * 100).toFixed(1);
    Logger.info("Program size: " + compression + "% of the original");

    return optimisedCode;
  };
};

Optimiser.optimise = function (machineCode) {
  return new Optimiser(machineCode).optimise();
};

module.exports = Optimiser;
