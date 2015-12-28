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
  },
  calls: function (spy) {
    var calls = [];

    for (var i = 0; i < spy.calls.count(); i += 1) {
      calls.push(spy.calls.argsFor(i)[0]);
    };

    return calls;
  }
};

module.exports = SpecHelper;
