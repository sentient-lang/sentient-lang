"use strict";

var _ = require("underscore");

var CodeWriter = function () {
  var self = this;
  var metadata = {};
  var variables = {};
  var clauses = [];
  var maxLiteral = 0;

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

    clauses.push(clause);
  };

  self.write = function () {
    var output = "";

    output += writeHeader();
    output += writeMetadata();
    output += writeProblemSize();
    output += writeClauses();

    return output;
  };

  var writeHeader = function () {
    return "c Sentient Machine Code, Version 1.0\n";
  };

  var writeMetadata = function () {
    metadata.variables = variables;

    var json = JSON.stringify(metadata, null, 2);
    var lines = json.split("\n");

    var output = "";
    _.each(lines, function (line) {
      output += "c " + line + "\n";
    });

    return output;
  };

  var writeProblemSize = function () {
    var numberOfLiterals = maxLiteral;
    var numberOfClauses = clauses.length;

    return "p cnf " + numberOfLiterals + " " + numberOfClauses + "\n";
  };

  var writeClauses = function () {
    return _.map(clauses, function (clause) {
      return clause.join(" ") + "\n";
    }).join("");
  };
};

module.exports = CodeWriter;
