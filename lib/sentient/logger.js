"use strict";

var colors = require("colors/safe");
colors.enabled = true;

var Logger = function () {
  var self = this;
  var defaultLevel = "silent";

  self.level = defaultLevel;

  self.color = false;

  self.reset = function () {
    self.level = defaultLevel;
    self.color = false;
    self.log = defaultLogFunction;
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
    if (typeof message === "object") {
      message = message.message;
    }

    if (typeof console === "undefined") {
      return;
    }

    if (typeof console.debug !== "undefined") {
      self.debugFunction = "debug";
    }

    if (typeof console.error !== "undefined") {
      self.errorFunction = "error";
    }

    if (typeof console.warn !== "undefined") {
      self.infoFunction = "warn";
      self.debugFunction = self.debugFunction || "warn";
      self.errorFunction = self.errorFunction || "warn";
    }

    self.debugFunction = self.debugFunction || "log";
    self.errorFunction = self.errorFunction || "log";
    self.infoFunction = self.infoFunction || "log";

    var logFunction = self[level + "Function"];

    if (numeric(self.level) >= numeric(level)) {
      message = colorize(message, level);
      console[logFunction](message);
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

  var colorize = function (message, level) {
    if (self.color) {
      var color = { debug: "grey", info: "yellow", error: "red" }[level];
      return colors[color](message);
    } else {
      return message;
    }
  };
};

module.exports = new Logger();
