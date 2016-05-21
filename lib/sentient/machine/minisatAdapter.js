"use strict";

var _ = require("underscore");
var Minisat = require("../../../vendor/minisat.js");
var Module;

var MinisatAdapter = function (dimacs) {
  var self = this;
  var errors = [];

  self.setup = function (heapSize, stackSize) {
    if (typeof Module !== "undefined") {
      return;
    }

    Module = new Minisat({
      TOTAL_MEMORY: heapSize,
      TOTAL_STACK: stackSize,
      DEBUG: false
    });
  };

  self.solve = function () {
    setupMinisatForProblem();
    captureErrors();
    var result = solve(dimacs);
    return parse(result);
  };

  var captureErrors = function () {
    Module.printErr = function (error) {
      errors.push(error);
    };
  };

  var solve = function (dimacs) {
    var functionName = "solve_string";
    var parameterType = "string";
    var returnType = ["string", "int"];
    var parameters = [dimacs, dimacs.length];

    return Module.ccall(
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

  // If Minisat crashes unexpectedly, these multipliers may need increasing.
  var setupMinisatForProblem = function () {
    var numberOfLines = (dimacs.match(/\n/g) || []).length;

    var heapSize = 16777216 + numberOfLines * 300;
    var stackSize = 8388608 + numberOfLines * 100;

    heapSize = complyWithAsmSpec(heapSize);

    self.setup(heapSize, stackSize);
  };

  var complyWithAsmSpec = function (heapSize) {
    var size = 64 * 1024;

    while (size < heapSize) {
      if (size < 16 * 1024 * 1024) {
        size *= 2;
      } else {
        size += 16 * 1024 * 1024;
      }
    }

    return size;
  };
};

MinisatAdapter.setup = function (heapSize, stackSize) {
  return new MinisatAdapter().setup(heapSize, stackSize);
};

MinisatAdapter.solve = function (dimacs) {
  return new MinisatAdapter(dimacs).solve();
};

module.exports = MinisatAdapter;
