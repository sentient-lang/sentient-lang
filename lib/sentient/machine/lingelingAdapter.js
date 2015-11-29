"use strict";

var spawnSync = require("child_process").spawnSync;
var _ = require("underscore");

var LingelingAdapter = function (binary, dimacs) {
  var self = this;

  self.solve = function () {
    var lingeling = spawnSync(binary, {
      input: dimacs,
      encoding: "utf-8"
    });

    var output = lingeling.stdout;

    if (!output) {
      var message = "The program 'lingeling' cannot be found in PATH";
      throw new Error(message);
    }

    var lines = output.split("\n");

    if (satisfiable(lines)) {
      return parseSolution(lines);
    }
    else {
      return [];
    }
  };

  var satisfiable = function (lines) {
    var satisfiableLine = _.detect(lines, function (line) {
      return line.match(/^s /);
    });

    if (!satisfiableLine) {
      var message = "Lingeling output did not contain satisfiability line";
      throw new Error(message);
    }

    return satisfiableLine === "s SATISFIABLE";
  };

  var parseSolution = function (lines) {
    var solutionLines = _.select(lines, function (line) {
      return line.match(/^v /);
    });

    var literals = [];

    _.each(solutionLines, function (line) {
      line = line.replace(/^v /, "");
      line = line.replace(/ 0$/, "");

      var terms = line.split(" ");
      _.each(terms, function (term) {
        literals.push(Number(term));
      });
    });

    return literals;
  };
};

LingelingAdapter.solve = function (dimacs) {
  return new LingelingAdapter("lingeling", dimacs).solve();
};

module.exports = LingelingAdapter;
