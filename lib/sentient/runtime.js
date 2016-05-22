"use strict";

var Level4Runtime = require("./runtime/level4Runtime");
var Level3Runtime = require("./runtime/level3Runtime");
var Level2Runtime = require("./runtime/level2Runtime");
var Level1Runtime = require("./runtime/level1Runtime");

var Machine = require("./machine");
var MinisatAdapter = require("./machine/minisatAdapter");

var Runtime = function (program, assignments, count, callback, adapter) {
  var self = this;

  self.run = function () {
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(adapter || MinisatAdapter);

    if (typeof callback === "undefined") {
      var results = machine.run(program, assignments, count);
      return decodeResults(results);
    } else {
      return machine.run(program, assignments, count, function (result) {
        callback(decodeResult(result));
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
    result = Level1Runtime.decode(program, result);
    result = Level2Runtime.decode(program, result);
    result = Level3Runtime.decode(program, result);
    result = Level4Runtime.decode(program, result);

    return result;
  };
};

Runtime.run = function (program, assignments, count, callback, adapter) {
  return new Runtime(program, assignments, count, callback, adapter).run();
};

module.exports = Runtime;
