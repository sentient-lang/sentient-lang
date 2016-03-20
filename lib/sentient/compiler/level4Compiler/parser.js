"use strict";

var PEG = require("pegjs");
var fs = require("fs");
var grammar = fs.readFileSync(__dirname + "/grammar.pegjs", "utf8");

var Parser = function (options) {
  var self = this;
  var pegjsParser = PEG.buildParser(grammar, options || {});

  self.parse = function (input) {
    return pegjsParser.parse(input);
  };
};

Parser.parse = function (input) {
  return new Parser().parse(input);
};

module.exports = Parser;
