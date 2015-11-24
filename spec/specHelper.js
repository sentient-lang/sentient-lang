"use strict";

var _ = require("underscore");

var SpecHelper = {
  stripWhitespace: function (string) {
    var lines = string.split("\n");

    lines = _.map(lines, function (line) {
      return line.trim();
    });

    if (lines[0] === "") {
      lines.splice(0, 1);
    }

    return lines.join("\n");
  }
};

module.exports = SpecHelper;
