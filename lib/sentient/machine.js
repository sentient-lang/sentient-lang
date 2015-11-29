"use strict";

var LingelingAdapter = require("./machine/lingelingAdapter");
var _ = require("underscore");

var Machine = function (solver) {
  var self = this;

  self.run = function (program, assignments) {
    var constrainedProgram = encodeConstraints(program, assignments);
    var result = solver.solve(constrainedProgram);

    return decodeResult(result);
  };

  var encodeConstraints = function (program, assignments) {
    var constraints = generateConstraints(assignments);
    var header = generateHeader(program, assignments);
    var constrainedProgram = program + constraints;

    return replaceHeader(constrainedProgram, header);
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

Machine.run = function (program, assignments) {
  return new Machine(LingelingAdapter).run(program, assignments);
};

module.exports = Machine;
