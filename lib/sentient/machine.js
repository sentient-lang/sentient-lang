"use strict";

var MinisatAdapter = require("./machine/minisatAdapter");
var _ = require("underscore");

var Machine = function (solver) {
  var self = this;

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
    if (typeof count === "undefined") {
      count = 1;
    }

    program = encodeConstraints(program, assignments);

    var result;

    for (var i = 0; i < count || count === 0; i += 1) {
      if (result) {
        program = excludeResult(program, result);
      }

      result = solver.solve(program);
      result = decodeResult(result);

      callback(result);

      if (_.isEmpty(result)) {
        break;
      }
    }
  };

  var encodeConstraints = function (program, assignments) {
    var constraints = generateConstraints(assignments);
    var header = generateHeader(program, assignments);
    var constrainedProgram = program + constraints;

    return replaceHeader(constrainedProgram, header);
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

    program = replaceHeader(program, header);
    program += clause;

    return program;
  };

  var decodeResult = function (result) {
    var object = {};

    _.each(result, function (literal) {
      if (literal < 0) {
        object[-literal] = false;
      }
      else {
        object[literal] = true;
      }
    });

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
    var lines = program.split("\n");

    var problemSizeLine = _.detect(lines, function (line) {
      return line.match(/p cnf/);
    });

    if (!problemSizeLine) {
      var message = "The line containing the problem size could not be found";
      throw new Error(message);
    }

    problemSizeLine = problemSizeLine.trim();
    var terms = problemSizeLine.split(" ");

    var numberOfLiterals = Number(terms[2]);
    var numberOfClauses = Number(terms[3]);
    var numberOfAssignments = _.size(assignments);

    var totalClauses = numberOfClauses + numberOfAssignments;

    self.numberOfLiterals = numberOfLiterals;
    self.numberOfClauses = totalClauses;

    return "p cnf " + numberOfLiterals + " " + totalClauses;
  };

  var replaceHeader = function (program, header) {
    var lines = program.split("\n");

    var problemSizeLine = _.detect(lines, function (line) {
      return line.match(/p cnf/);
    });

    var index = lines.indexOf(problemSizeLine);

    lines.splice(index, 1);
    lines.unshift(header);

    return lines.join("\n");
  };
};

Machine.run = function (program, assignments, count, callback) {
  return new Machine(MinisatAdapter).run(program, assignments, count, callback);
};

module.exports = Machine;
