"use strict";

var Level4Runtime = require("./runtime/level4Runtime");
var Level3Runtime = require("./runtime/level3Runtime");
var Level2Runtime = require("./runtime/level2Runtime");
var Level1Runtime = require("./runtime/level1Runtime");

var Machine = require("./machine");
var MinisatAdapter = require("./machine/minisatAdapter");
var Logger = require("./logger");

var Runtime = function (program, assignments, count, callback, adapter) {
  var self = this;

  self.run = function () {
    if (typeof callback === "undefined") {
      return run();
    } else {
      return setTimeout(run, 0);
    }
  };

  var run = function () {
    if (typeof program === "string") {
      Logger.info("Parsing program...");
      program = JSON.parse(program);
    }

    Logger.info("Running program...");

    Logger.debug("Encoding level 4 assignments");
    assignments = Level4Runtime.encode(program, assignments);

    Logger.debug("Encoding level 3 assignments");
    assignments = Level3Runtime.encode(program, assignments);

    Logger.debug("Encoding level 2 assignments");
    assignments = Level2Runtime.encode(program, assignments);

    Logger.debug("Encoding level 1 assignments");
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(adapter || MinisatAdapter);

    if (typeof callback === "undefined") {
      var results = machine.run(program, assignments, count);
      results = decodeResults(results);
      Logger.debug("Finished decoding results");
      return results;
    } else {
      return machine.run(program, assignments, count, function (result) {
        result = decodeResult(result);
        Logger.debug("Passing result to callback");
        callback(result);
      });
    }
  };

  var decodeResults = function (results) {
    var decodedResults = [];

    for (var i = 0; i < results.length; i += 1) {
      decodedResults.push(decodeResult(results[i]));
    }

    return decodedResults;
  };

  var decodeResult = function (result) {
    Logger.debug("Decoding level 1 result");
    result = Level1Runtime.decode(program, result);

    Logger.debug("Decoding level 2 result");
    result = Level2Runtime.decode(program, result);

    Logger.debug("Decoding level 3 result");
    result = Level3Runtime.decode(program, result);

    Logger.debug("Decoding level 4 result");
    result = Level4Runtime.decode(program, result);

    return result;
  };
};

Runtime.run = function (program, assignments, count, callback, adapter) {
  return new Runtime(program, assignments, count, callback, adapter).run();
};

module.exports = Runtime;
