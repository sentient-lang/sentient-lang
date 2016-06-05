"use strict";

var MappingParser = require("./coprocessorAdapter/mappingParser");
var MetadataExtractor = require("../runtime/metadataExtractor");
var Logger = require("../logger");

var spawnSync = require("child_process").spawnSync;
var fs = require("fs");
var _ = require("underscore");

var CoprocessorAdapter = function (binary, machineCode) {
  var self = this;

  self.optimise = function () {
    var filenames = generateFilenames();

    var metadata = MetadataExtractor.extract(machineCode);
    writeWhitelist(metadata, filenames.whitelist);

    var args = generateArguments(filenames);
    var result;

    try {
      result = runCoprocessor(args, filenames);
    } catch (error) {
      deleteFiles(filenames);

      if (error.message.match(/ENOENT/)) {
        var message = "The program 'riss' cannot be found in PATH.\n";
        message += "This is perfectly normal. Sentient doesn't ship with ";
        message += "Riss.\nYou can try to install it with:\n\n";
        message += installScript();
        message += "\n";

        throw new Error(message);
      } else {
        throw error;
      }
    }

    deleteFiles(filenames);

    if (result.stderr) {
      Logger.info("Riss Coprocessor wrote to stderr: " + result.stderr);
    }

    if (result.stdout) {
      Logger.debug(result.stdout);
    }

    var mappings = MappingParser.parse(result.mappings);
    updateLiterals(metadata, mappings);

    return generateMachineCode(metadata, result.dimacs);
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

  var writeWhitelist = function (metadata, filename) {
    var level1Variables = metadata.level1Variables;
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
      input: machineCode,
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

  var updateLiterals = function (metadata, mappings) {
    var level1Variables = metadata.level1Variables;

    _.each(level1Variables, function (literal, name) {
      var mappedLiteral = mappings[literal];

      if (typeof mappedLiteral !== "undefined") {
        level1Variables[name] = mappedLiteral;
      }
    });
  };

  var generateMachineCode = function (metadata, dimacs) {
    var machineCode = "c Sentient Machine Code, Version 1.0\n";

    var json = JSON.stringify(metadata, null, 2);
    var lines = json.split("\n");

    _.each(lines, function (line) {
      machineCode += "c " + line + "\n";
    });

    return machineCode + dimacs;
  };

  var installScript = function () {
    var lines = [
      "wget http://tools.computational-logic.org/content/riss/Riss.tar.gz",
      "tar xzf Riss.tar.gz && mv Riss riss-427 && pushd riss-427"
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

CoprocessorAdapter.optimise = function (machineCode) {
  return new CoprocessorAdapter("coprocessor", machineCode).optimise();
};

module.exports = CoprocessorAdapter;
