/* jshint maxlen: 100 */
/* jshint maxcomplexity: 10 */

"use strict";

var CLI = function (Sentient) {
  var LingelingAdapter = require("./machine/lingelingAdapter");
  var RissAdapter = require("./machine/rissAdapter");
  var Optimiser = require("./optimiser");

  var info = Sentient.info;
  var commander = require("commander");
  var fs = require("fs");
  var readline = require("readline");
  var fileName, io, input, lines = [];
  var assignments = "{}", number = 1, machine;

  var self = this;

  /* jshint maxcomplexity: false */
  self.run = function () {
    commander["arguments"]("[file]")
      .description(info.description + ", Version " + info.version)
      .version(info.version, "-v, --version")
      .option("-s, --set '<json>'", "set some of the program variables")
      .option("-f, --setf <file>", "read variables to set from a file")
      .option("-n, --number <n>", "number of solutions to return")
      .option("-m, --machine <name>", "specify which machine adapter to use")
      .option("-c, --compile", "only compile, do not run")
      .option("-o, --optimise", "enable machine code optimisation")
      .option("-r, --run", "run a pre-compiled program")
      .action(function (file) { fileName = file; })
      .on("--help", function () {
        console.log("  Explanation:");
        console.log();
        console.log("  --set");
        console.log();
        console.log("  The 'set' option is used to assign values to variables");
        console.log("  within a Sentient program. Any variable that appears in");
        console.log("  an 'expose' statement will be assignable. Assignments");
        console.log("  impose additional constraints on the program when it runs.");
        console.log();
        console.log("  A set of assignments must be a valid JSON object. Each");
        console.log("  variable to be assigned should appear as a key of this");
        console.log("  object. Values can be booleans, integers or arrays.");
        console.log();
        console.log("  Arrays support additional syntax that allows some of its");
        console.log("  elements to be set, whilst leaving others unset. You can");
        console.log("  either mark elements as 'undefined' or set elements by");
        console.log("  array index. The last two examples below are equivalent.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --set '{ a: true, b: 123, c: -50 }'");
        console.log("    $ sentient --set '{ foo: [1, 2, 3] }'");
        console.log("    $ sentient --set '{ foo: [undefined, 2] }'");
        console.log("    $ sentient --set '{ foo: { 1: 2 } }'");
        console.log();
        console.log("  --setf");
        console.log();
        console.log("  The 'setf' option works in the same was as 'set' except");
        console.log("  it reads its assignments from a file. This is useful when");
        console.log("  setting variables on command-line becomes unwieldy.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --setf assignments.json");
        console.log();
        console.log("  --number");
        console.log();
        console.log("  The 'number' option specifies how many solutions should be");
        console.log("  returned. By default, this value is 1. If a value of 0 is");
        console.log("  specified, Sentient will continue to search for solutions.");
        console.log();
        console.log("  It is possible that all solutions are found before the");
        console.log("  specified number is reached. In this case, an empty object");
        console.log("  will be returned and Sentient will terminate.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --number 5");
        console.log("    $ sentient --number 0");
        console.log();
        console.log("  --machine");
        console.log();
        console.log("  The 'machine' option specifies which SAT solver is used to");
        console.log("  run programs. Having the ability to swap out the solver");
        console.log("  allows programs to be run on different platforms.");
        console.log();
        console.log("  By default, the 'minisat' adapter is used, which is a");
        console.log("  version of MiniSat that has been compiled into JavaScript");
        console.log("  with Emscripten. Currently, Sentient supports two more");
        console.log("  adapters: 'lingeling' and 'riss', which are faster but");
        console.log("  must be installed before they can be used.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --machine lingeling");
        console.log("    $ sentient --machine riss");
        console.log();
        console.log("  --compile");
        console.log();
        console.log("  The 'compile' option changes the output to be compiled");
        console.log("  machine code rather than the result of running the");
        console.log("  program. This machine code can then be run later by using");
        console.log("  the 'run' option.");
        console.log();
        console.log("  It is useful to pre-compile a program when you intend to");
        console.log("  repeatedly run it with different sets of assignments. For");
        console.log("  example, you might write a program that solves knapsack,");
        console.log("  then repeatedly run it with different constraints.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --compile");
        console.log();
        console.log("  --optimise");
        console.log();
        console.log("  This 'optimise' option switches on machine code optimisation");
        console.log("  which attempts to minimise the resulting SAT problem before");
        console.log("  it is fed to the machine for solving. In order to use");
        console.log("  optimisation, you will need to have installed the");
        console.log("  'Riss Coprocessor' executable.");
        console.log();
        console.log("  It is possible to optimise programs during compilation as");
        console.log("  well as retroactively, after machine code has been generated.");
        console.log("  It is not recommended to use optimisation unless the");
        console.log("  program is compiled and run in separate stages with the");
        console.log("  intention of running a particular program multiple times.");
        console.log();
        console.log("    $ sentient --optimise");
        console.log();
        console.log("  --run");
        console.log();
        console.log("  The 'run' option is used to run a pre-compiled program");
        console.log("  rather than running the program from source. This is");
        console.log("  the recommended way to run programs as it means that much");
        console.log("  of the work in interpreting and optimising programs has");
        console.log("  already been completed by the compilation stage.");
        console.log();
        console.log("  Examples:");
        console.log();
        console.log("    $ sentient --run");
        console.log();
      })
      .parse(process.argv);

    if (!commander.compile && !commander.run) {
      commander.compile = true;
      commander.run = true;
    }

    if (commander.set && commander.setf) {
      console.error("Error: please use either --set or --setf but not both");
      process.exit(1);
    } else if (commander.set) {
      assignments = commander.set;
    } else if (commander.setf) {
      assignments = fs.readFileSync(commander.setf, "utf8");
    }

    if (commander.number) {
      number = parseInt(commander.number, 10);
    }

    // JavaScript is more lenient then JSON with quoted keys.
    // Also, JSON doesn't support undefined, only null.
    /* jshint -W061 */
    eval("assignments = " + assignments);

    switch (commander.machine) {
      case "lingeling":
        machine = LingelingAdapter;
      break;
      case "riss":
        machine = RissAdapter;
      break;
      case "minisat":
      break;
      case undefined:
      break;
      default:
        throw new Error("Unknown machine: '" + commander.machine + "'");
    }

    if (fileName) {
      input = fs.createReadStream(fileName);
    } else {
      input = process.stdin;
    }

    io = readline.createInterface({ input: input, terminal: false });

    io.on("line", function (line) {
      lines.push(line);
    });

    io.on("close", function () {
      var program = lines.join("\n");

      if (commander.compile) {
        program = Sentient.compile(program);
      }

      if (commander.optimise) {
        program = Optimiser.optimise(program);
      }

      if (commander.run) {
        Sentient.run(program, assignments, number, function (result) {
          console.log(result);
        }, machine);
      } else {
        console.log(program);
      }
    });
  };
};

module.exports = CLI;
