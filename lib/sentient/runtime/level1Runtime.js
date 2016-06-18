"use strict";

var _ = require("underscore");

var Level1Runtime = function (program) {
  var self = this;
  var variables = program.level1Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      if (!_.has(variables, key)) {
        var message = "Could not encode '" + key + "'";
        message += " because it does not appear in the program metadata";

        throw new Error(message);
      }

      key = Number(variables[key]);
      object[key] = value;
    });

    return object;
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    _.each(variables, function (value, key) {
      value = results[value];

      if (value === undefined) {
        var message = "Could not decode '" + key + "'";
        message += " because it does not appear in the solution results";

        throw new Error(message);
      }

      object[key] = value;
    });

    return object;
  };
};

Level1Runtime.encode = function (program, assignments) {
  return new Level1Runtime(program).encode(assignments);
};

Level1Runtime.decode = function (program, results) {
  return new Level1Runtime(program).decode(results);
};

module.exports = Level1Runtime;
