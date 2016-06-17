"use strict";

var _ = require("underscore");

var CodeWriter = function (callbackObject) {
  var self = this;
  var metadata = {};
  var variables = {};
  var clauses = "";
  var maxLiteral = 0;
  var numberOfClauses = 0;

  self.metadata = function (object) {
    metadata = object;
  };

  self.variable = function (symbol, literal) {
    variables[symbol] = literal;
  };

  self.clause = function () {
    var clause = [];

    _.each(arguments, function (literal) {
      clause.push(literal);

      var positiveLiteral = Math.abs(literal);

      if (positiveLiteral > maxLiteral) {
        maxLiteral = positiveLiteral;
      }
    });

    clauses += clause.join(" ") + " 0\n";
    numberOfClauses += 1;
  };

  self.write = function () {
    var output = "";

    output += writeHeader();
    output += writeMetadata();
    output += writeProblemSize();
    output += clauses;

    if (callbackObject) {
      callbackObject.write(output);
    } else {
      return output;
    }
  };

  var writeHeader = function () {
    return "c Sentient Machine Code, Version 1.0\n";
  };

  var writeMetadata = function () {
    metadata.level1Variables = variables;

    var json = JSON.stringify(metadata, null, 2);
    var lines = json.split("\n");

    var output = "";
    _.each(lines, function (line) {
      output += "c " + line + "\n";
    });

    return output;
  };

  var writeProblemSize = function () {
    return "p cnf " + maxLiteral + " " + numberOfClauses + "\n";
  };
};

module.exports = CodeWriter;
