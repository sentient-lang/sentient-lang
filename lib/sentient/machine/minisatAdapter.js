"use strict";

var _ = require("underscore");
var Minisat = require("../../../vendor/minisat.js");

var MinisatAdapter = function (dimacs) {
  var self = this;
  var errors = [];

  self.solve = function () {
    captureErrors();
    var result = solve(dimacs);
    return parse(result);
  };

  var captureErrors = function () {
    Minisat.printErr = function (error) {
      errors.push(error);
    };
  };

  var solve = function (dimacs) {
    var functionName = "solve_string";
    var parameterType = "string";
    var returnType = ["string", "int"];
    var parameters = [dimacs, dimacs.length];

    return Minisat.ccall(
      functionName,
      parameterType,
      returnType,
      parameters
    );
  };

  var parse = function (result) {
    if (_.any(errors)) {
      throw new Error(errors);
    } else if (result === "UNSAT") {
      return [];
    } else {
      result = result.replace("SAT ", "");
      result = result.split(" ");

      return _.map(result, function (literal) {
        return parseInt(literal, 10);
      });
    }
  };
};

MinisatAdapter.solve = function (dimacs) {
  return new MinisatAdapter(dimacs).solve();
};

module.exports = MinisatAdapter;
