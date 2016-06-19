/*jshint maxcomplexity:7 */

"use strict";

var TwosComplement = require("../compiler/level2Compiler/twosComplement");
var _ = require("underscore");

var Level2Runtime = function (program) {
  var self = this;
  var variables = program.level2Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      if (!_.has(variables, key)) {
        var message = "Could not encode '" + key + "'";
        message += " because it does not appear in the program metadata";

        throw new Error(message);
      }

      var expectedType = variables[key].type;
      var actualType = typeName(value);

      if (expectedType !== actualType) {
        throw new Error("Expected " + expectedType + " for " + key);
      }

      var symbols = variables[key].symbols;

      if (actualType === "boolean") {
        object[symbols[0]] = value;
      } else if (actualType === "integer") {
        var bitArray = TwosComplement.encode(value);
        var max = symbols.length;

        if (bitArray.length > max) {
          var msg = "The value '" + value + "' requires " + bitArray.length;
          msg += " bits, but the compiled program supports a maximum of " + max;
          msg += " bits.\nEither assign a smaller value or re-compile with a";
          msg += " larger number of bits.";

          throw new Error(msg);
        }

        var padded = TwosComplement.pad(bitArray, symbols);

        for (var i = 0; i < symbols.length; i += 1) {
          object[symbols[i]] = padded.leftSymbols[i];
        }
      }
    });

    return object;
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    _.each(variables, function (variable, key) {
      var type = variable.type;
      var symbols = variable.symbols;

      var values = _.map(symbols, function (s) {
        var value = results[s];

        if (value === undefined) {
          var message = "Could not decode '" + key + "'";
          message += " because it is missing from the result";

          throw new Error(message);
        }

        return value;
      });

      if (type === "boolean") {
        object[key] = values[0];
      } else if (type === "integer") {
        object[key] = TwosComplement.decode(values);
      }
    });

    return object;
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else {
      throw new Error("Unknown type '" + t + "'");
    }
  };
};

Level2Runtime.encode = function (program, assignments) {
  return new Level2Runtime(program).encode(assignments);
};

Level2Runtime.decode = function (program, results) {
  return new Level2Runtime(program).decode(results);
};

module.exports = Level2Runtime;
