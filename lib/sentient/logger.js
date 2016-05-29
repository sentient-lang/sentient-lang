"use strict";

var Logger = function () {
  var self = this;
  var defaultLevel = "silent";

  self.level = defaultLevel;

  self.reset = function () {
    self.level = defaultLevel;
  };

  self.debug = function (message) {
    log(message, "debug");
  };

  self.info = function (message) {
    log(message, "info");
  };

  // We use console.warn here so that node logs to stderr, which does not
  // interfere if stdout is piped elsewhere.
  var log = function (message, level) {
    if (typeof console === "undefined") {
      return;
    }

    if (typeof console.warn === "undefined") {
      return;
    }

    if (numeric(self.level) >= numeric(level)) {
      console.warn(message);
    }
  };

  var numeric = function (level) {
    switch (level) {
      case "silent":
        return -1;
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
