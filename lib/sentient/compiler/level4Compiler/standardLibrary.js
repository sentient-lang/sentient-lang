"use strict";

var StandardLibrary = function () {
  var self = this;
  var instructions = [];

  var define = function (name, args, body, returns, dynamic) {
    instructions.push({
      type: "define",
      name: name,
      args: args,
      immutable: true,
      dynamic: dynamic
    });

    instructions = instructions.concat(body);

    instructions.push({
      type: "return",
      width: returns
    });
  };

  define("[]", ["self", "index"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "index" },
    { type: "fetch" }
  ], 1);

  define("abs", ["self"], [
    { type: "push", symbol: "self" },
    { type: "absolute" }
  ], 1);

  define("-@", ["self"], [
    { type: "push", symbol: "self" },
    { type: "negate" }
  ], 1);

  define("!@", ["self"], [
    { type: "push", symbol: "self" },
    { type: "not" }
  ], 1);

  define("length", ["self"], [
    { type: "push", symbol: "self" },
    { type: "width" }
  ], 1);

  define("*", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "multiply" }
  ], 1);

  define("/", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "divide" }
  ], 1);

  define("%", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "modulo" }
  ], 1);

  define("+", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "add" }
  ], 1);

  define("-", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "subtract" }
  ], 1);

  define("<", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "lessthan" }
  ], 1);

  define(">", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "greaterthan" }
  ], 1);

  define("<=", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "lessequal" }
  ], 1);

  define(">=", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "greaterequal" }
  ], 1);

  define("==", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "equal" }
  ], 1);

  define("!=", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "equal" },
    { type: "not" }
  ], 1);

  define("&&", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "and" }
  ], 1);

  define("||", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "or" }
  ], 1);

  define("if", ["self", "consequent", "alternate"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "consequent" },
    { type: "push", symbol: "alternate" },
    { type: "if" }
  ], 1);

  define("divmod", ["self", "other"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "other" },
    { type: "divmod" }
  ], 2);

  define("get", ["self", "index"], [
    { type: "push", symbol: "self" },
    { type: "push", symbol: "index" },
    { type: "get", checkBounds: true }
  ], 2);

  define("each", ["self", "*fn"], [
    { type: "push", symbol: "self" },
    { type: "pointer", name: "fn" },
    { type: "each" }
  ], 1, true);

  define("eachPair", ["self", "*fn"], [
    { type: "push", symbol: "self" },
    { type: "pointer", name: "fn" },
    { type: "eachPair" }
  ], 1, true);

  self.instructions = instructions;
};

module.exports = StandardLibrary;
