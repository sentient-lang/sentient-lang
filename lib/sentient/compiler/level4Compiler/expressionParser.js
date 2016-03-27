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
        return parseSubExpression(expression);
      default:
        throw new Error("Unexpected expression: " + expression);
    }
  };

  var parseSubExpression = function (expression) {
    var methodCall = coerceToMethodCall(expression);
    return parseMethodCall(methodCall);
  };

  var coerceToMethodCall = function (expression) {
    var length = expression.length;
    var methodCall;

    switch (length) {
      case 2:
        methodCall = [expression[0], [], expression[1] + "@"];
        break;
      case 3:
        methodCall = expression;
        break;
      default:
        throw new Error("Unexpected length: " + length);
    }

    if (typeof methodCall[1] !== "object") {
      methodCall[1] = [methodCall[1]];
    }

    return methodCall;
  };

  /*jshint maxcomplexity:false */
  var parseMethodCall = function (expression) {
    var targetExpression = expression[0];
    var argExpressions = expression[1];
    var methodName = expression[2];

    var instructions = self.parse(targetExpression);

    _.each(argExpressions, function (argExpression) {
      instructions = instructions.concat(self.parse(argExpression));
    });

    switch (methodName) {
      case "[]":
        instructions.push({ type: "fetch" });
        break;
      case "abs":
        instructions.push({ type: "absolute" });
        break;
      case "-@":
        instructions.push({ type: "negate" });
        break;
      case "!@":
        instructions.push({ type: "not" });
        break;
      case "collect":
        var width = argExpressions.length + 1;
        instructions.push({ type: "collect", width: width });
        break;
      case "length":
        instructions.push({ type: "width" });
        break;
      case "*":
        instructions.push({ type: "multiply" });
        break;
      case "/":
        instructions.push({ type: "divide" });
        break;
      case "%":
        instructions.push({ type: "modulo" });
        break;
      case "+":
        instructions.push({ type: "add" });
        break;
      case "-":
        instructions.push({ type: "subtract" });
        break;
      case "<":
        instructions.push({ type: "lessthan" });
        break;
      case ">":
        instructions.push({ type: "greaterthan" });
        break;
      case "<=":
        instructions.push({ type: "lessequal" });
        break;
      case ">=":
        instructions.push({ type: "greaterequal" });
        break;
      case "==":
        instructions.push({ type: "equal" });
        break;
      case "!=":
        instructions.push({ type: "equal" });
        instructions.push({ type: "not" });
        break;
      case "&&":
        instructions.push({ type: "and" });
        break;
      case "||":
        instructions.push({ type: "or" });
        break;
      case "if":
        instructions.push({ type: "if" });
        break;
      case "divmod":
        instructions.push({ type: "divmod" });
        break;
      case "get":
        instructions.push({ type: "get" });
        break;
      default:
        throw new Error("Undefined method '" + methodName + "'");
    }

    return instructions;
  };
};

ExpressionParser.parse = function (expression) {
  return new ExpressionParser().parse(expression);
};

module.exports = ExpressionParser;
