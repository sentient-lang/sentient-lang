"use strict";

var CLI = function (Sentient, process) {
  var self = this;

  var commander = require("commander");
  var fs = require("fs");
  var readline = require("readline");
  var Explanation = require("./cli/explanation");

  var LingelingAdapter = require("./machine/lingelingAdapter");
  var RissAdapter = require("./machine/rissAdapter");

  process = process || global.process;
  commander = new commander.Command();

  var info = Sentient.info;

  self.run = function () {
    readCommandLineArguments();

    var stream = parseStream();
    var mode = parseMode();
    var assignments = parseAssignments();
    var number = parseNumberArgument();
    var machine = parseMachineArgument();
    var level = parseLogLevel();

    readInput(stream, function (program) {
      Sentient.logger.level = level;

      if (mode.compile) {
        program = Sentient.compile(program);
      }

      if (mode.optimise) {
        program = Sentient.optimise(program);
      }

      if (mode.run) {
        Sentient.run(program, assignments, number, function (result) {
          console.log(result);
        }, machine);
      } else {
        console.log(program);
      }
    });
  };

  var readCommandLineArguments = function () {
    commander["arguments"]("[file]")
      .description(info.description + ", Version " + info.version)
      .option("-H, --help-verbose", "output usage information with explanation")
      .version(info.version, "-v, --version")
      .option("-c, --compile", "compile a program to machine code")
      .option("-o, --optimise", "optimise a pre-compiled program")
      .option("-r, --run", "run a pre-compiled program")
      .option("-a, --assign '<json>'", "assign some of the exposed variables")
      .option("-A, --assign-file <file>", "read assignments from a file")
      .option("-n, --number <n>", "return the given number of solutions")
      .option("-m, --machine <name>", "use the specified machine adapter")
      .option("-i, --info", "set the log level to info")
      .option("-d, --debug", "set the log level to debug")
      .action(function (file) { commander.fileName = file; })
      .parse(process.argv);

    if (commander.helpVerbose) {
      commander.outputHelp();
      Explanation.print();
      process.exit(0);
    }
  };

  var parseStream = function () {
    var input;

    if (commander.fileName) {
      input = fs.createReadStream(commander.fileName);
    } else {
      input = process.stdin;
    }

    return readline.createInterface({ input: input, terminal: false });
  };

  var parseMode = function () {
    if (!commander.compile && !commander.optimise && !commander.run) {
      return { compile: true, run: true };
    }

    return {
      compile: commander.compile,
      optimise: commander.optimise,
      run: commander.run
    };
  };

  var parseAssignments = function () {
    var assignments = "{}";

    if (commander.assign && commander.assignFile) {
      console.error("Error: please use either --assign or --assign-file");
      process.exit(1);
    } else if (commander.assign) {
      assignments = commander.assign;
    } else if (commander.assignFile) {
      assignments = fs.readFileSync(commander.assignFile, "utf8");
    }

    // JavaScript is more lenient then JSON with quoted keys.
    // Also, JSON doesn't support undefined, only null.
    /* jshint -W061 */
    eval("assignments = " + assignments);

    return assignments;
  };

  var parseNumberArgument = function () {
    var number = 1;

    if (commander.number) {
      number = parseInt(commander.number, 10);
    }

    return number;
  };

  var parseMachineArgument = function () {
    switch (commander.machine) {
      case "minisat":
        return;
      case "lingeling":
        return LingelingAdapter;
      case "riss":
        return RissAdapter;
      case undefined:
        return;
      default:
        throw new Error("Unknown machine: '" + commander.machine + "'");
    }
  };

  var parseLogLevel = function () {
    if (commander.info) {
      return "info";
    }

    if (commander.debug) {
      return "debug";
    }

    return "silent";
  };

  var readInput = function (stream, callback) {
    var lines = [];

    stream.on("line", function (line) {
      lines.push(line);
    });

    stream.on("close", function () {
      callback(lines.join("\n"));
    });
  };
};

module.exports = CLI;
