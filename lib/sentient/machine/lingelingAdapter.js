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
    var errors = lingeling.stderr;

    if (!output) {
      var message = "The program 'lingeling' cannot be found in PATH.\n";
      message += "This is perfectly normal. Sentient doesn't ship with ";
      message += "Lingeling.\nYou can try to install it with:\n\n";
      message += installScript();
      message += "\n";

      throw new Error(message);
    }

    if (errors) {
      throw new Error("Lingeling wrote to stderr: " + errors);
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
        var literal = Number(term);

        if (literal !== 0) {
          literals.push(literal);
        }
      });
    });

    return literals;
  };

  var installScript = function () {
    var lines;

    if (process.platform === "darwin") {
      lines = [
        "brew tap sentient-lang/lingeling",
        "brew install lingeling"
      ];
    } else {
      lines = [
        "wget http://fmv.jku.at/lingeling/lingeling-bal-2293bef-151109.tar.gz",
        "tar xfz lingeling-bal-2293bef-151109.tar.gz",
        "pushd lingeling-bal-2293bef-151109 && ./configure.sh && make && popd",
        "cp lingeling-bal-2293bef-151109/lingeling /usr/local/bin/",
        "rm -rf lingeling-bal-2293bef-151109*"
      ];
    }

    return lines.join(" &&\n");
  };
};

LingelingAdapter.solve = function (dimacs) {
  return new LingelingAdapter("lingeling", dimacs).solve();
};

module.exports = LingelingAdapter;
