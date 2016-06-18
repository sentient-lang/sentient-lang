"use strict";

var MappingParser = require("./coprocessorAdapter/mappingParser");
var Logger = require("../logger");

var spawnSync = require("child_process").spawnSync;
var fs = require("fs");
var _ = require("underscore");

var CoprocessorAdapter = function (binary, machineCode) {
  var self = this;

  self.optimise = function () {
    var filenames = generateFilenames();

    writeWhitelist(machineCode, filenames.whitelist);

    var args = generateArguments(filenames);
    var result;

    try {
      result = runCoprocessor(args, filenames);
    } catch (error) {
      deleteFiles(filenames);

      if (error.message.match(/ENOENT/)) {
        var message = "The program 'coprocessor' cannot be found in PATH.\n";
        message += "This is perfectly normal. Sentient doesn't ship with ";
        message += "Riss Coprocessor.\nYou can try to install it with:\n\n";
        message += installScript();
        message += "\n";

        throw new Error(message);
      } else {
        throw error;
      }
    }

    deleteFiles(filenames);

    if (result.stderr) {
      Logger.debug("Riss Coprocessor wrote to stderr: " + result.stderr);
    }

    var mappings = MappingParser.parse(result.mappings);

    updateLiterals(machineCode, mappings);
    updateDimacs(machineCode, mappings, result.dimacs);

    return machineCode;
  };

  var generateFilenames = function () {
    var currentTime = new Date().getTime();

    return {
      dimacs: "/tmp/" + currentTime + ".dimacs",
      undo: "/tmp/" + currentTime + ".undo",
      undoMap: "/tmp/" + currentTime + ".undo.map",
      whitelist: "/tmp/" + currentTime + ".whitelist"
    };
  };

  var writeWhitelist = function (machineCode, filename) {
    var level1Variables = machineCode.level1Variables;
    var literals = _.values(level1Variables);
    var whitelist =  literals.join("\n") + "\n";

    fs.writeFileSync(filename, whitelist);
  };

  var generateArguments = function (filenames) {
    return [
      "-dimacs=" + filenames.dimacs,
      "-undo=" + filenames.undo,
      "-whiteList=" + filenames.whitelist,
      "-enabled_cp3",
      "-bve",
      "-dense",
      "-ee",
      "-hte",
      "-rate",
      "-subsimp",
      "-unhide",
      "-up"
    ];
  };

  var runCoprocessor = function (args, filenames) {
    var coprocessor = spawnSync(binary, args, {
      input: machineCode.dimacs,
      encoding: "utf-8"
    });

    var dimacs = fs.readFileSync(filenames.dimacs, "utf8");
    var mappings = fs.readFileSync(filenames.undoMap, "utf8");

    return {
      stdout: coprocessor.stdout,
      stderr: coprocessor.stderr,
      dimacs: dimacs,
      mappings: mappings
    };
  };

  var deleteFiles = function (filenames) {
    try { fs.unlinkSync(filenames.dimacs); } catch (error) { }
    try { fs.unlinkSync(filenames.undo); } catch (error) { }
    try { fs.unlinkSync(filenames.undoMap); } catch (error) { }
    try { fs.unlinkSync(filenames.whitelist); } catch (error) { }
  };

  var updateLiterals = function (machineCode, mappings) {
    var level1Variables = machineCode.level1Variables;

    _.each(level1Variables, function (literal, name) {
      var mappedLiteral = mappings[literal];

      if (typeof mappedLiteral !== "undefined") {
        level1Variables[name] = mappedLiteral;
      }
    });
  };

  var updateDimacs = function (machineCode, mappings, dimacs) {
    var level1Variables = machineCode.level1Variables;
    var mappedLiterals = _.uniq(_.values(level1Variables));

    var endOfFirstLine = dimacs.indexOf("\n");
    var problemSize = dimacs.substring(0, endOfFirstLine);

    dimacs = dimacs.slice(endOfFirstLine);

    var addedClauses = 0;

    for (var i = 0; i < mappedLiterals.length; i += 1) {
      var mappedLiteral = mappedLiterals[i];
      var regex = new RegExp("\\b" + mappedLiteral + "\\b");
      var includesLiteral = dimacs.match(regex);

      if (!includesLiteral) {
        dimacs += mappedLiteral + " -" + mappedLiteral + " 0\n";
        addedClauses += 1;
      }
    }

    var terms = problemSize.split(" ");

    var numberOfLiterals = parseInt(terms[2], 10);
    var numberOfClauses = parseInt(terms[3], 10) + addedClauses;

    problemSize = "p cnf " + numberOfLiterals + " " + numberOfClauses;

    machineCode.dimacs = problemSize + dimacs;
  };

  var installScript = function () {
    var lines;

    if (process.platform === "darwin") {
      lines = [
        "brew tap sentient-lang/riss",
        "brew install riss"
      ];
    } else {
      lines = [
        "wget http://tools.computational-logic.org/content/riss/Riss.tar.gz",
        "tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427",
        "make && make coprocessorRS && popd",
        "cp riss-427/riss /usr/local/bin/",
        "cp riss-427/coprocessor /usr/local/bin/",
        "rm -rf riss-427 Riss.tar.gz"
      ];
    }

    return lines.join(" &&\n");
  };
};

CoprocessorAdapter.optimise = function (machineCode) {
  return new CoprocessorAdapter("coprocessor", machineCode).optimise();
};

module.exports = CoprocessorAdapter;
