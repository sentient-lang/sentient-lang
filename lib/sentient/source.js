"use strict";

var Logger = require("./logger");

var Source = function (program) {
  var self = this;

  self.retrieve = function () {
    if (typeof program === "string") {
      Logger.info("Parsing program...");
      program = JSON.parse(program);
    }

    Logger.info("Retrieving source code");

    return program.source;
  };
};

Source.retrieve = function (program) {
  return new Source(program).retrieve();
};

module.exports = Source;
