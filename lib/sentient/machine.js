"use strict";

var MinisatAdapter = require("./machine/minisatAdapter");
var Logger = require("./logger");
var _ = require("underscore");

var Machine = function (solver) {
  var self = this;
  var literalMap;

  self.run = function (program, assignments, count, callback) {
    if (typeof callback === "undefined") {
      return runSynchronously(program, assignments, count);
    } else {
      return runAsychronously(program, assignments, count, callback);
    }
  };

  var runSynchronously = function (program, assignments, count) {
    var results = [];

    run(program, assignments, count, function (result) {
      results.push(result);
    });

    return results;
  };

  var runAsychronously = function (program, assignments, count, callback) {
    var timer = setTimeout(function () {
      run(program, assignments, count, callback);
    }, 0);

    return timer;
  };

  var run = function (program, assignments, count, callback) {
    var level1Variables = program.level1Variables;
    literalMap = _.invert(level1Variables);

    if (typeof count === "undefined") {
      count = 1;
    }

    program = _.clone(program);

    encodeConstraints(program, assignments);

    var result;

    for (var i = 0; i < count || count === 0; i += 1) {
      Logger.debug("=== Running (iteration " + i + ") ===");

      if (result) {
        Logger.debug("Excluding previous result from subsequent iterations");
        excludeResult(program, result);
      }

      Logger.debug("Solving SAT problem");
      result = solver.solve(program.dimacs);

      Logger.debug("Decoding SAT result");
      result = decodeResult(result);

      Logger.debug("Passing result to runtime");
      callback(result);

      if (_.isEmpty(result)) {
        break;
      }
    }

    Logger.info("Finished running");
  };

  var encodeConstraints = function (program, assignments) {
    var constraints = generateConstraints(assignments);
    var header = generateHeader(program, assignments);
    var constrainedDimacs = program.dimacs + constraints;

    program.dimacs = replaceHeader(constrainedDimacs, header);
  };

  var excludeResult = function (program, result) {
    self.numberOfClauses += 1;

    var header = "p cnf " + self.numberOfLiterals + " " + self.numberOfClauses;
    var clause = "\nc excluded clause\n";

    _.each(result, function (bool, literal) {
      if (bool) {
        clause += "-";
      }

      clause += literal + " ";
    });

    clause += "0\n";

    var dimacs = program.dimacs;

    dimacs = replaceHeader(dimacs, header);
    dimacs += clause;

    program.dimacs = dimacs;
  };

  var decodeResult = function (result) {
    var object = {};

    for (var i = 0; i < result.length; i += 1) {
      var literal = result[i];
      var positive = true;

      if (literal < 0) {
        positive = false;
        literal *= -1;
      }

      if (literalMap[literal]) {
        object[literal] = positive;
      }
    }

    return object;
  };

 var generateConstraints = function (assignments) {
    return _.map(assignments, function (value, key) {
      if (!value) {
        key = -key;
      }

      return "" + key + " 0";
    }).join("\n");
  };

  var generateHeader = function (program, assignments) {
    var dimacs = program.dimacs;
    var endOfFirstLine = dimacs.indexOf("\n");
    var problemSize = dimacs.substring(0, endOfFirstLine);

    if (problemSize.substring(0, 5) !== "p cnf") {
      var message = "The line containing the problem size could not be found";
      throw new Error(message);
    }

    var terms = problemSize.split(" ");

    var numberOfLiterals = Number(terms[2]);
    var numberOfClauses = Number(terms[3]);
    var numberOfAssignments = _.size(assignments);

    var totalClauses = numberOfClauses + numberOfAssignments;

    self.numberOfLiterals = numberOfLiterals;
    self.numberOfClauses = totalClauses;

    return "p cnf " + numberOfLiterals + " " + totalClauses;
  };

  var replaceHeader = function (dimacs, header) {
    var endOfFirstLine = dimacs.indexOf("\n");
    return header + dimacs.slice(endOfFirstLine);
  };
};

Machine.run = function (program, assignments, count, callback) {
  return new Machine(MinisatAdapter).run(program, assignments, count, callback);
};

module.exports = Machine;
