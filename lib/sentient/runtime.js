"use strict";

var Level4Runtime = require("./runtime/level4Runtime");
var Level3Runtime = require("./runtime/level3Runtime");
var Level2Runtime = require("./runtime/level2Runtime");
var Level1Runtime = require("./runtime/level1Runtime");

var Machine = require("./machine");

var MinisatAdapter = require("./machine/minisatAdapter");
var LingelingAdapter = require("./machine/lingelingAdapter");

var Runtime = function (program, assignments, count, adapterName) {
  var self = this;

  self.run = function () {
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(adapter(adapterName));
    var results = machine.run(program, assignments, count);

    var decodedResults = [];

    for (var i = 0; i < results.length; i += 1) {
      var result = results[i];

      result = Level1Runtime.decode(program, result);
      result = Level2Runtime.decode(program, result);
      result = Level3Runtime.decode(program, result);
      result = Level4Runtime.decode(program, result);

      decodedResults.push(result);
    }

    return decodedResults;
  };

  var adapter = function (adapterName) {
    adapterName = adapterName || "minisat";

    switch (adapterName) {
      case "lingeling":
        return LingelingAdapter;
      case "minisat":
        return MinisatAdapter;
      default:
        throw new Error("Unknown adapter: '" + adapterName + "'");
    }
  };
};

Runtime.run = function (program, assignments, count, adapterName) {
  return new Runtime(program, assignments, count, adapterName).run();
};

module.exports = Runtime;
