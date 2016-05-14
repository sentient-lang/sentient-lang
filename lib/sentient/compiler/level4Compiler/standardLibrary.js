"use strict";

var _ = require("underscore");

var StandardLibrary = function (params) {
  var self = this;

  var codeWriter = params.codeWriter;
  var syntaxParser = params.syntaxParser;
  var instructionSet = params.instructionSet;

  self.defineFunctions = function () {
    defineRaw("[]", ["self", "index"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "index" },
      { type: "fetch" }
    ], 1);

    defineRaw("abs", ["self"], [
      { type: "push", symbol: "self" },
      { type: "absolute" }
    ], 1);

    defineRaw("-@", ["self"], [
      { type: "push", symbol: "self" },
      { type: "negate" }
    ], 1);

    defineRaw("!@", ["self"], [
      { type: "push", symbol: "self" },
      { type: "not" }
    ], 1);

    defineRaw("length", ["self"], [
      { type: "push", symbol: "self" },
      { type: "width" }
    ], 1);

    defineRaw("*", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "multiply" }
    ], 1);

    defineRaw("/", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "divide" }
    ], 1);

    defineRaw("%", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "modulo" }
    ], 1);

    defineRaw("+", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "add" }
    ], 1);

    defineRaw("-", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "subtract" }
    ], 1);

    defineRaw("<", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "lessthan" }
    ], 1);

    defineRaw(">", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "greaterthan" }
    ], 1);

    defineRaw("<=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "lessequal" }
    ], 1);

    defineRaw(">=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "greaterequal" }
    ], 1);

    defineRaw("==", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "equal" }
    ], 1);

    defineRaw("!=", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "equal" },
      { type: "not" }
    ], 1);

    defineRaw("&&", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "and" }
    ], 1);

    defineRaw("||", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "or" }
    ], 1);

    defineRaw("if", ["self", "consequent", "alternate"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "consequent" },
      { type: "push", symbol: "alternate" },
      { type: "if" }
    ], 1);

    defineRaw("divmod", ["self", "other"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "other" },
      { type: "divmod" }
    ], 2);

    defineRaw("get", ["self", "index"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "index" },
      { type: "get", checkBounds: true }
    ], 2);

    defineRaw("each", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "each" }
    ], 1, true);

    defineRaw("eachPair", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "eachPair" }
    ], 1, true);

    define("                                                    \n\
      function uniq?& (self) {                                  \n\
        unique = true;                                          \n\
                                                                \n\
        self.eachPair(function^ (left, right, i, j, lP, rP) {   \n\
          unique &&= if(lP && rP, left != right, true);         \n\
        });                                                     \n\
                                                                \n\
        return unique;                                          \n\
      };                                                        \n\
    ");

    // These are special cases handled by ExpressionParser.
    reserveName("collect");
  };

  var define = function (input) {
    _.each(syntaxParser.parse(input), instructionSet.call);
  };

  var defineRaw = function (name, args, body, returns, dynamic) {
    codeWriter.instruction({
      type: "define",
      name: name,
      args: args,
      immutable: true,
      dynamic: dynamic
    });

    _.each(body, codeWriter.instruction);

    codeWriter.instruction({ type: "return", width: returns });
  };

  var reserveName = function (name) {
    defineRaw(name, [], [], 0, false);
  };
};

module.exports = StandardLibrary;
