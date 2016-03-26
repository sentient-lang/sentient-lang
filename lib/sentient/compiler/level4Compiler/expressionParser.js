"use strict";

var _ = require("underscore");

var ExpressionParser = function () {
  var self = this;

  self.parse = function (expression) {
    var instructions = [];

    switch (typeof expression) {
      case "boolean":
      case "number":
        instructions.push({ type: "constant", value: expression });
        break;
      case "string":
        instructions.push({ type: "push", symbol: expression });
        break;
      case "object":
        instructions = instructions.concat(parseArray(expression));
        break;
    }

    return instructions;
  };

  var parseArray = function (expression) {
    var instructions = [];

    switch (expression.length) {
      case 2:
        instructions = instructions.concat(parseUnary(expression));
    }

    return instructions;
  };

  var parseUnary = function (expression) {
    var instructions = [];

    switch (_.last(expression)) {
      case "collect":
        instructions = instructions.concat(parseCollect(expression));
        break;
    }

    return instructions;
  };

  var parseCollect = function (expression) {
    var instructions = [];

    var collection = expression[0];

    _.each(collection, function (element) {
      instructions = instructions.concat(self.parse(element));
    });

    instructions.push({ type: "collect", width: collection.length });

    return instructions;
  };
};

ExpressionParser.parse = function (expression) {
  return new ExpressionParser().parse(expression);
}

module.exports = ExpressionParser;
