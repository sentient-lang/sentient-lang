"use strict";

var Level4Runtime = require("./runtime/level4Runtime");
var Level3Runtime = require("./runtime/level3Runtime");
var Level2Runtime = require("./runtime/level2Runtime");
var Level1Runtime = require("./runtime/level1Runtime");

var Machine = require("./machine");

var MinisatAdapter = require("./machine/minisatAdapter");
var LingelingAdapter = require("./machine/lingelingAdapter");

var Runtime = function (program, assignments, adapterName) {
  var self = this;

  self.run = function () {
    assignments = Level4Runtime.encode(program, assignments);
    assignments = Level3Runtime.encode(program, assignments);
    assignments = Level2Runtime.encode(program, assignments);
    assignments = Level1Runtime.encode(program, assignments);

    var machine = new Machine(adapter(adapterName));
    var results = machine.run(program, assignments);

    results = Level1Runtime.decode(program, results);
    results = Level2Runtime.decode(program, results);
    results = Level3Runtime.decode(program, results);
    results = Level4Runtime.decode(program, results);

    return results;
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

Runtime.run = function (program, assignments, adapterName) {
  return new Runtime(program, assignments, adapterName).run();
};

module.exports = Runtime;
