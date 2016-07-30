"use strict";

var SyntaxParser = require("./syntaxParser");
var ExpressionParser = require("./expressionParser");
var CodeWriter = require("./codeWriter");
var Registry = require("./registry");
var InstructionSet = require("./instructionSet");

var _ = require("underscore");

var StandardLibrary = function () {
  var self = this;

  var syntaxParser = SyntaxParser;
  var expressionParser = new ExpressionParser();
  var codeWriter = new CodeWriter();
  var registry = new Registry("Stdlib");

  var instructionSet = new InstructionSet({
    codeWriter: codeWriter,
    expressionParser: expressionParser,
    registry: registry
  });

  self.writeInstructions = function () {
    return codeWriter.write().instructions;
  };

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

    defineRaw("bounds?", ["self", "index"], [
      { type: "push", symbol: "self" },
      { type: "push", symbol: "index" },
      { type: "bounds" }
    ], 1);

    defineRaw("transpose", ["self"], [
      { type: "push", symbol: "self" },
      { type: "transpose" }
    ], 1);

    defineRaw("each", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "each" }
    ], 1, true);

    defineRaw("map", ["self", "*fn"], [
      { type: "push", symbol: "self" },
      { type: "pointer", name: "fn" },
      { type: "map" }
    ], 1, true);

    define("                                                    \n\
      function^ uniqBy?& (self, *uniqByFn) {                    \n\
        uniqueByResult = true;                                  \n\
                                                                \n\
        self.eachCombination(2, function^ (e, i, p) {           \n\
          uniqueByResult &&= if(                                \n\
            p[0] && p[1],                                       \n\
            uniqByFn(e[0]) != uniqByFn(e[1]),                   \n\
            true                                                \n\
          );                                                    \n\
        });                                                     \n\
                                                                \n\
        return uniqueByResult;                                  \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function include?& (self, element) {                      \n\
        return self.reduce(false, function^ (acc, e, i, p) {    \n\
          return acc || p.if(element == e, false);              \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function^ countBy& (self, *countByFn) {                   \n\
        return self.reduce(0, function^ (acc, e, i, p) {        \n\
          return acc + (p && countByFn(e) ? 1 : 0);             \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function^ all?& (self, *allFn) {                          \n\
        return self.reduce(true, function^ (acc, e, i, p) {     \n\
          return acc && p.if(allFn(e), true);                   \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function^ any?& (self, *anyFn) {                          \n\
        return self.reduce(false, function^ (acc, e, i, p) {    \n\
          return acc || p.if(anyFn(e), false);                  \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function^ none?& (self, *noneFn) {                        \n\
        return self.reduce(true, function^ (acc, e, i, p) {     \n\
          return acc && p.if(!noneFn(e), true);                 \n\
        });                                                     \n\
      };                                                        \n\
    ");

    define("                                                    \n\
      function^ one?& (self, *oneFn) {                          \n\
        return self.countBy(*oneFn) == 1;                       \n\
      };                                                        \n\
    ");

    define("function self& (self) { return self; };");

    // Array methods
    define("function first& (self) { return self[0]; };");
    define("function last& (self) { return self[self.length - 1]; };");
    define("function size& (self) { return self.length; };");
    define("function count& (self) { return self.length; };");
    define("function^ collect& (self, *fn) { return self.map(*fn); };");
    define("function member?& (self, e) { return self.include?(e); };");
    define("function uniq?& (self) { return self.uniqBy?(*self); };");

    // Integer methods
    define("function positive?& (self) { return self > 0; };");
    define("function negative?& (self) { return self < 0; };");
    define("function zero?& (self) { return self == 0; };");
    define("function even?& (self) { return self % 2 == 0; };");
    define("function odd?& (self) { return self % 2 == 1; };");
    define("function succ& (self) { return self + 1; };");
    define("function next& (self) { return self.succ; };");
    define("function pred& (self) { return self - 1; };");
    define("function prev& (self) { return self.pred; };");
    define("function square& (self) { return self * self; };");
    define("function cube& (self) { return self * self * self; };");

    // These are special cases handled by ExpressionParser.
    reserveName("buildArray");
    reserveName("upto");
    reserveName("downto");
    reserveName("times");
    reserveName("eachCombination");
    reserveName("eachCons");
    reserveName("eachSlice");
    reserveName("reduce");
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

module.exports.instructions = (function () {
  var singleton = new StandardLibrary();
  singleton.defineFunctions();
  return singleton.writeInstructions();
})();
