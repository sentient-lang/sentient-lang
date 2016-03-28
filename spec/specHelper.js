"use strict";

var _ = require("underscore");
var PEG = require("pegjs");
var fs = require("fs");

var grammar, grammarPath = __dirname +
  "/../lib/sentient/compiler/level4Compiler/grammar.pegjs";

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
    }

    return calls;
  },
  parserForRule: function (rule) {
    if (!grammar) {
      grammar = fs.readFileSync(grammarPath, "utf8");
    }

    return PEG.buildParser(grammar, {
      allowedStartRules: [rule]
    });
  }
};

module.exports = SpecHelper;
