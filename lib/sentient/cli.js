#!/usr/bin/env node

"use strict";

var Sentient = require("../sentient");
var commander = require("commander");
var pjson = require("../../package.json");
var fs = require("fs");
var readline = require("readline");
var fileName, io, input, lines = [];
var assignments = "{}", adapter = "minisat";

commander["arguments"]("[file]")
  .description(pjson.description + ", Version " + pjson.version)
  .option("-e, --examples", "output some examples")
  .version(pjson.version, "-v, --version")
  .option("-s, --set '<json>'", "set some of the program variables")
  .option("-f, --setf <file>", "read variables to set from a file")
  .option("-a, --adapter <name>", "use the specified SAT adapter")
  .option("-c, --compile", "only compile, do not run")
  .option("-r, --run", "run a pre-compiled program")
  .action(function (file) { fileName = file; })
  .on("--help", function () {
    console.log("  Explanation:");
    console.log();
    console.log("  --set");
    console.log();
    console.log("  The 'set' option is used to assign values to variables");
    console.log("  within a Sentient program. Any variable that appears in");
    console.log("  a 'vary' statement will be assignable. Assignments impose");
    console.log("  additional constraints on the program when it runs.");
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
    console.log("  --adapter");
    console.log();
    console.log("  The 'adapter' option specifies which SAT solver is used to");
    console.log("  run programs. Having the ability to swap out the solver");
    console.log("  allows programs to be run on different platforms.");
    console.log();
    console.log("  By default, the 'minisat' adapter is used, which is a");
    console.log("  version of MiniSat that has been compiled into JavaScript");
    console.log("  with Emscripten. Currently, the only other supported");
    console.log("  adapter is 'lingeling', which is faster, but requires");
    console.log("  access to the 'lingeling' executable.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --adapter lingeling");
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
    console.log("  --run");
    console.log();
    console.log("  The 'run' option is used to run a pre-compiled program");
    console.log("  rather than running the program from source. See above.");
    console.log();
    console.log("  Examples:");
    console.log();
    console.log("    $ sentient --run");
    console.log();
  })
  .parse(process.argv);

if (commander.examples) {
  console.log();
  console.log("  The following examples can be pasted into your prompt.");
  console.log();
  console.log("  ----------------------------------------");
  console.log();
  console.log("  Find two numbers that add up to 50:");
  console.log();
  console.log("  $ echo 'int a, b;");
  console.log("          total = a + b;");
  console.log("          vary a, b, total;' |");
  console.log();
  console.log("    sentient --set '{ total: 50 }'");
  console.log();
  console.log("  ----------------------------------------");
  console.log();
  console.log("  Find solutions to a^2 + b^2 = c^2:");
  console.log();
  console.log("  $ echo 'int a, b, c;");
  console.log();
  console.log("          a2 = a * a;");
  console.log("          b2 = b * b;");
  console.log("          c2 = c * c;");
  console.log();
  console.log("          invariant a2 + b2 == c2;");
  console.log("          invariant a > 0, b > 0;");
  console.log();
  console.log("          vary a, b, c;' |");
  console.log();
  console.log("    sentient --set '{ c: 5 }'");
  console.log();
  console.log("  ----------------------------------------");
  console.log();
  console.log("  Find two primes that multiply to the target:");
  console.log();
  console.log("  $ echo 'primes = [2, 3, 5, 7, 11];");
  console.log();
  console.log("          int i, j;");
  console.log("          p1, p2 = primes[i], primes[j];");
  console.log();
  console.log("          target = p1 * p2;");
  console.log("          vary p1, p2, target;' |");
  console.log();
  console.log("    sentient --set '{ target: 35 }'");
  console.log();
  console.log("  ----------------------------------------");
  console.log();
  console.log("  More information and examples at " + pjson.homepage + ".");
  console.log();

  process.exit(0);
}
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

// JavaScript is more lenient then JSON with quoted keys.
// Also, JSON doesn't support undefined, only null.
/* jshint -W061 */
eval("assignments = " + assignments);

if (commander.adapter) {
  adapter = commander.adapter;
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
  var results;

  if (commander.compile) {
    program = Sentient.compile(program);
  }

  if (commander.run) {
    results = Sentient.run(program, assignments, adapter);
  }

  console.log(results || program);
  process.exit(0);
});
