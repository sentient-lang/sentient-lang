"use strict";

var _ = require("underscore");

var ExpressionParser = function () {
  var self = this;

  self.parse = function (expression) {
    expression = self.preprocess(expression);

    switch (typeof expression) {
      case "boolean":
      case "number":
        return [{ type: "constant", value: expression }];
      case "string":
        if (isFunctionPointer(expression)) {
          return [{ type: "pointer", name: expression }];
        } else {
          return [{ type: "push", symbol: expression }];
        }
        break;
      case "object":
        return parseFunctionCall(expression);
      default:
        throw new Error("Unexpected expression: " + expression);
    }
  };

  self.preprocess = function (expression) {
    if (expression.length === 2) {
      if (expression[0] === "-@" && self.integerLiteral(expression[1])) {
        expression = -expression[1];
      }

      if (expression[0] === "!@" && self.booleanLiteral(expression[1])) {
        expression = !expression[1];
      }
    }

    return expression;
  };

  var parseFunctionCall = function (expression) {
    var functionName = expression.shift();
    var argExpressions = expression;
    var width = argExpressions.length;

    var instructions = [];
    var parseArgs = function () {
      _.each(argExpressions, function (argExpression) {
        instructions = instructions.concat(self.parse(argExpression));
      });
    };

    switch (functionName) {
      case "collect":
        parseArgs();
        instructions.push({ type: "collect", width: width });
      break;
      default:
        parseArgs();
        instructions.push({ type: "call", name: functionName, width: width });
    }

    return instructions;
  };

  var isFunctionPointer = function (name) {
    return name[0] === "*";
  };
};

ExpressionParser.parse = function (expression) {
  return new ExpressionParser().parse(expression);
};

module.exports = ExpressionParser;
