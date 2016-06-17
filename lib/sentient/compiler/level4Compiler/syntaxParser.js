"use strict";

var pegParser = require("./pegParser");

var SyntaxParser = function (input) {
  var self = this;

  self.parse = function () {
    try {
      return pegParser.parse(input);
    } catch (error) {
      var location = error.location.end;

      var lineNumber = location.line;
      var colNumber = location.column - 1;

      var lines = input.split("\n");
      var line = lines[lineNumber - 1];

      var symbol = error.found;

      if (symbol) {
        symbol = "'" + symbol + "'";
      } else {
        symbol = "end-of-input";
        colNumber += 1;
      }

      var message = "syntax error, unexpected " + symbol;
      message += "\n  " + line + "\n  ";

      for (var i = 0; i < colNumber - 1; i += 1) {
        message += " ";
      }

      message += "^";

      var syntaxError = new Error(message);

      syntaxError.name = "sentient:" + lineNumber + ":" + colNumber;
      syntaxError.originatingLevel = "syntax";

      throw syntaxError;
    }
  };
};

SyntaxParser.parse = function (input) {
  return new SyntaxParser(input).parse();
};

module.exports = SyntaxParser;
