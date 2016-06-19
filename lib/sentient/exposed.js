"use strict";

var _ = require("underscore");
var Logger = require("./logger");

var Exposed = function (program) {
  var self = this;

  var l3 = program.level3Variables;
  var l2 = program.level2Variables;

  self.retrieve = function () {
    Logger.info("Retrieving exposed variables...");

    var records = {};

    _.each(_.keys(l3), function (variable) {
      var record = retrieveOne(variable, false);

      if (typeof record !== "undefined") {
        records[variable] = record;

        Logger.debug("Retrieved '" + variable + "'");
      }
    });

    Logger.info("Finished retrieving");

    return records;
  };

  var retrieveOne = function (variable, returnSupporting) {
    var attributes = l3[variable];
    var type = attributes.type;
    var supporting = attributes.supporting;
    var symbols = attributes.symbols;

    if (supporting && !returnSupporting) {
      return;
    }

    var object = { type: type };

    if (typeof attributes.nilDecider !== "undefined") {
      object.maybe = true;
    }

    if (type === "integer") {
      var bounds = retrieveBounds(symbols[0]);

      object.minimum = bounds.minimum;
      object.maximum = bounds.maximum;
    }

    if (type === "array") {
      var elements = _.map(symbols, function (symbol) {
        return retrieveOne(symbol, true);
      });

      object.width = symbols.length;
      object.elements = elements;
    }

    return object;
  };

  var retrieveBounds = function (symbol) {
    var attributes = l2[symbol];
    var symbols = attributes.symbols;
    var numberOfBits = symbols.length;
    var minimum = -Math.pow(2, numberOfBits - 1);
    var maximum = -minimum - 1;

    return { minimum: minimum, maximum: maximum };
  };
};

Exposed.retrieve = function (program) {
  if (typeof program === "string") {
    program = JSON.parse(program);
  }

  return new Exposed(program).retrieve();
};

module.exports = Exposed;
