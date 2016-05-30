"use strict";

var spawnSync = require("child_process").spawnSync;
var _ = require("underscore");

var RissAdapter = function (binary, dimacs) {
  var self = this;

  self.solve = function () {
    var riss = spawnSync(binary, {
      input: dimacs,
      encoding: "utf-8"
    });

    var output = riss.stdout;
    var errors = riss.stderr;

    if (!output) {
      var message = "The program 'riss' cannot be found in PATH.\n";
      message += "This is perfectly normal. Sentient doesn't ship with ";
      message += "Riss.\nYou can try to install it with:\n\n";
      message += installScript();
      message += "\n";

      throw new Error(message);
    }

    if (errors) {
      throw new Error("Riss wrote to stderr: " + errors);
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
      var message = "Riss output did not contain satisfiability line";
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
    var lines = [
      "wget http://tools.computational-logic.org/content/riss/Riss.tar.gz",
      "tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427",
    ];

    if (process.platform === "darwin") {
      lines.push("wget https://git.io/vrQxX -O riss-427-mac-os-x.patch");
      lines.push("patch -p1 < riss-427-mac-os-x.patch");
    }

    lines = lines.concat([
      "make && make coprocessorRS && popd",
      "cp riss-427/riss /usr/local/bin/",
      "cp riss-427/coprocessor /usr/local/bin/",
      "rm -rf riss-427 Riss.tar.gz"
    ]);

    return lines.join(" &&\n");
  };
};

RissAdapter.solve = function (dimacs) {
  return new RissAdapter("riss", dimacs).solve();
};

module.exports = RissAdapter;
