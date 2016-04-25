"use strict";

var _ = require("underscore");

var ExpressionParser = function () {
  var self = this;

  self.parse = function (expression) {
    switch (typeof expression) {
      case "boolean":
      case "number":
        return [{ type: "constant", value: expression }];
      case "string":
        return [{ type: "push", symbol: expression }];
      case "object":
        return parseFunctionCall(expression);
      default:
        throw new Error("Unexpected expression: " + expression);
    }
  };

  var parseFunctionCall = function (expression) {
    var functionName = expression.shift();
    var argExpressions = expression;
    var width = argExpressions.length;

    var instructions = [];

    _.each(argExpressions, function (argExpression) {
      instructions = instructions.concat(self.parse(argExpression));
    });

    // Variadic functions are not supported.
    if (functionName === "collect") {
      instructions.push({ type: "collect", width: width });
    } else {
      instructions.push({ type: "call", name: functionName, width: width });
    }

    return instructions;
  };
};

ExpressionParser.parse = function (expression) {
  return new ExpressionParser().parse(expression);
};

module.exports = ExpressionParser;
