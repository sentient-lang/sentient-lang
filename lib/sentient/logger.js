"use strict";

var Logger = function () {
  var self = this;
  var defaultLevel = "error";

  self.level = defaultLevel;

  self.reset = function () {
    self.level = defaultLevel;
  };

  self.debug = function (message) {
    self.log(message, "debug");
  };

  self.info = function (message) {
    self.log(message, "info");
  };

  self.error = function (error) {
    self.log(error, "error");
  };

  /* jshint maxcomplexity: false */
  var defaultLogFunction = function (message, level) {
    if (typeof console === "undefined") {
      return;
    }

    self.debugFunction = console.debug || console.warn || console.log;
    self.infoFunction = console.warn || console.log;
    self.errorFunction = console.error || console.warn || console.log;

    if (numeric(self.level) >= numeric(level)) {
      self[level + "Function"](message);
    }
  };

  self.log = defaultLogFunction;

  var numeric = function (level) {
    switch (level) {
      case "silent":
        return -1;
      case "error":
        return 3;
      case "info":
        return 6;
      case "debug":
        return 7;
      default:
        throw new Error("Unrecognised log level: '" + level + "'");
    }
  };
};

module.exports = new Logger();
