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
    var output = metadata;

    writeMetadata(output);
    writeDimacs(output);

    if (callbackObject) {
      callbackObject.write(output);
    } else {
      return output;
    }
  };

  var writeMetadata = function (output) {
    output.level1Variables = variables;
  };

  var writeDimacs = function (output) {
    output.dimacs = "p cnf " + maxLiteral + " " + numberOfClauses + "\n";
    output.dimacs += clauses;
  };
};

module.exports = CodeWriter;
