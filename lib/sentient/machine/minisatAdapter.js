"use strict";

var _ = require("underscore");
var Minisat = require("../../../vendor/minisat.js");
var Module;

var MinisatAdapter = function (dimacs) {
  var self = this;
  var errors = [];
  var sixteenMeg =  16777216;
  var eightMeg = 8388608;

  self.setup = function (heapSize, stackSize) {
    Module = new Minisat({
      TOTAL_MEMORY: heapSize,
      TOTAL_STACK: stackSize,
      DEBUG: false
    });

    Module.heapSize = heapSize;
    Module.stackSize = stackSize;
  };

  self.solve = function () {
    return increaseMemoryOnError(function () {
      setMemoryHeuristic();
      captureErrors();
      var result = solve(dimacs);
      return parse(result);
    });
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

  var setMemoryHeuristic = function () {
    if (Module) {
      return;
    }

    var numberOfLines = (dimacs.match(/\n/g) || []).length;

    var heapSize = sixteenMeg + numberOfLines * 300;
    var stackSize = eightMeg + numberOfLines * 100;

    heapSize = complyWithAsmSpec(heapSize);

    self.setup(heapSize, stackSize);
  };

  var warnAboutResize = function (heapSize, stackSize) {
    var heap = (heapSize / 1024 / 1024).toFixed(1);
    var stack = (stackSize / 1024 / 1024).toFixed(1);

    var warning = "Warning: resizing Minisat memory to ";
    warning += heap + "MB heap, " + stack + "MB stack";

    console.warn(warning);
  };

  var increaseMemoryOnError = function (callback) {
    try {
      return callback();
    } catch (error) {
      var message = error.message || "";

      var heapSize = Module.heapSize;
      var stackSize = Module.stackSize;

      if (message.substring(0, 18) === "No heap space left") {
        heapSize += sixteenMeg;
        stackSize += eightMeg;
      } else if (message.substring(0, 19) === "No stack space left") {
        heapSize += sixteenMeg;
        stackSize += eightMeg;
      } else {
        throw error;
      }

      heapSize = complyWithAsmSpec(heapSize);
      warnAboutResize(heapSize, stackSize);

      Module = undefined;
      self.setup(heapSize, stackSize);

      return increaseMemoryOnError(callback);
    }
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
