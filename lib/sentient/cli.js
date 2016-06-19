"use strict";

var commander = require("commander");
var fs = require("fs");
var readline = require("readline");

var Sentient = require("../sentient");
var Explanation = require("./cli/explanation");
var LingelingAdapter = require("./machine/lingelingAdapter");
var RissAdapter = require("./machine/rissAdapter");

var CLI = function (process) {
  var self = this;

  process = process || global.process;

  var info = Sentient.info;
  var command = new commander.Command();

  self.run = function () {
    readCommandLineArguments();

    var stream = parseStream();
    var mode = parseMode();
    var assignments = parseAssignments();
    var number = parseNumberArgument();
    var machine = parseMachineArgument();
    var level = parseLogLevel();

    readInput(stream, function (program) {
      handleErrors(level, function () {
        Sentient.logger.level = level;
        Sentient.logger.color = true;

        if (mode.compile) {
          program = Sentient.compile(program);
        }

        if (mode.optimise) {
          program = Sentient.optimise(program);
        }

        if (mode.exposed) {
          var exposed = Sentient.exposed(program);
          console.log(JSON.stringify(exposed, null, 2));
        } else if (mode.source) {
          var source = Sentient.source(program);
          console.log(source);
        } else if (mode.run) {
          Sentient.run(program, assignments, number, function (result) {
            console.log(JSON.stringify(result));
          }, machine);
        } else {
          console.log(JSON.stringify(program, null, 2));
        }
      });
    });
  };

  var readCommandLineArguments = function () {
    command["arguments"]("[file]")
      .description(info.description + ", Version " + info.version)
      .option("-H, --help-verbose", "output usage information with explanation")
      .version(info.version, "-v, --version")
      .option("-c, --compile", "compile a program to machine code")
      .option("-o, --optimise", "optimise a compiled program")
      .option("-r, --run", "run a compiled program")
      .option("-s, --source", "output the source of a compiled program")
      .option("-e, --exposed", "output exposed variables of a compiled program")
      .option("-a, --assign '<json>'", "assign some of the exposed variables")
      .option("-A, --assign-file <file>", "read assignments from a file")
      .option("-n, --number <n>", "return the given number of solutions")
      .option("-m, --machine <name>", "use the specified machine adapter")
      .option("-i, --info", "set the log level to info")
      .option("-d, --debug", "set the log level to debug")
      .action(function (file) { command.fileName = file; })
      .parse(process.argv);

    if (command.helpVerbose) {
      command.outputHelp();
      Explanation.print();
      process.exit(0);
    }
  };

  var parseStream = function () {
    var input;

    if (command.fileName) {
      input = fs.createReadStream(command.fileName);
    } else {
      input = process.stdin;
    }

    return readline.createInterface({ input: input, terminal: false });
  };

  var parseMode = function () {
    var c = command;

    if (!c.compile && !c.optimise && !c.run && !c.source && !c.exposed) {
      return { compile: true, run: true };
    }

    return {
      compile: c.compile,
      optimise: c.optimise,
      run: c.run,
      source: c.source,
      exposed: c.exposed
    };
  };

  var parseAssignments = function () {
    var assignments = "{}";

    if (command.assign && command.assignFile) {
      console.error("Error: please use either --assign or --assign-file");
      process.exit(1);
    } else if (command.assign) {
      assignments = command.assign;
    } else if (command.assignFile) {
      assignments = fs.readFileSync(command.assignFile, "utf8");
    }

    // JavaScript is more lenient then JSON with quoted keys.
    // Also, JSON doesn't support undefined, only null.
    /* jshint -W061 */
    eval("assignments = " + assignments);

    return assignments;
  };

  var parseNumberArgument = function () {
    var number = 1;

    if (command.number) {
      number = parseInt(command.number, 10);
    }

    return number;
  };

  var parseMachineArgument = function () {
    switch (command.machine) {
      case "minisat":
        return;
      case "lingeling":
        return LingelingAdapter;
      case "riss":
        return RissAdapter;
      case undefined:
        return;
      default:
        throw new Error("Unknown machine: '" + command.machine + "'");
    }
  };

  var parseLogLevel = function () {
    if (command.info) {
      return "info";
    }

    if (command.debug) {
      return "debug";
    }

    return "error";
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

  var handleErrors = function (level, callback) {
    catchAsynchronousErrors();

    try {
      callback();
    } catch (error) {
      // errors are printed by Sentient.logger
    }
  };

  var catchAsynchronousErrors = function () {
    if (typeof process === "undefined") {
      return;
    }

    if (typeof process.on === "undefined") {
      return;
    }

    process.on("uncaughtException", function (error) {
      Sentient.logger.error(error);
    });
  };
};

CLI.run = function () {
  return new CLI().run();
};

module.exports = CLI;
