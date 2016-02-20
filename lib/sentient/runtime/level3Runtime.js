/*jshint maxcomplexity:7 */

"use strict";

var MetadataExtractor = require("./metadataExtractor");
var _ = require("underscore");

var Level3Runtime = function (program) {
  var self = this;
  var metadata = MetadataExtractor.extract(program);
  var variables = metadata.level3Variables;

  self.encode = function (assignments) {
    var object = {};

    _.each(assignments, function (value, key) {
      encodeOne(key, value, object);
    });

    return object;
  };

  var encodeOne = function (key, value, object, allowSupporting) {
    var message;

    if (!_.has(variables, key)) {
      message = "Could not encode '" + key + "'";
      message += " because it does not appear in the program metadata";

      throw new Error(message);
    }

    var specifiedType = variables[key].type;
    var actualType = typeName(value);

    if (!typeIsAllowed(specifiedType, actualType)) {
      message = "Expected an object of type '" + specifiedType;
      message += "' for key '" + key + "' but got '" + actualType + "'";
      throw new Error(message);
    }

    if (variables[key].supporting && !allowSupporting) {
      throw new Error(key + " is a supporting variable");
    }

    var symbols = variables[key].symbols;

    if (specifiedType === "boolean" || specifiedType === "integer") {
      assignOnce(symbols[0], value, object);
    } else if (specifiedType === "array") {
      encodeArray(symbols, value, actualType, key, object);
    }
  };

  var encodeArray = function (keys, values, actualType, key, object) {
    if (actualType === "array" && _.size(keys) !== _.size(values)) {
      var message = "Size mismatch when assinging values to '" + key + "'.";
      message += " Either set trailing elements to 'undefined'";
      message += " or use the object syntax.";

      throw new Error(message);
    }

    _.each(values, function (value, index) {
      if (value !== undefined) {
        var key = keys[index];
        encodeOne(key, value, object, true);
      }
    });
  };

  self.decode = function (results) {
    if (_.isEmpty(results)) {
      return {};
    }

    var object = {};

    decodePrimitives(results, object);
    decodeArrays(object);
    removeSupporting(object);

    return object;
  };

  var decodePrimitives = function (results, object) {
    _.each(variables, function (variable, key) {
      if (variable.type === "boolean" || variable.type === "integer") {
        decodePrimitive(key, variable, results, object);
      }
    });
  };

  var decodePrimitive = function (key, variable, results, object) {
    var type = variable.type;
    var symbols = variable.symbols;

    var values = _.map(symbols, function (s) {
      var value = results[s];

      if (value === undefined) {
        var message = "Could not decode '" + key + "'";
        message += " because '" + s + "' is missing from the result";

        throw new Error(message);
      }

      return value;
    });

    if (type === "boolean" || type === "integer") {
      object[key] = values[0];
    }
  };

  var decodeArrays = function (object) {
    _.each(variables, function (variable, key) {
      if (variable.type === "array") {
        decodeArray(variable, key, object);
      }
    });
  };

  var decodeArray = function (variable, key, object) {
    var array = _.map(variable.symbols, function (symbol) {
      return decodeElement(symbol, object);
    });

    assignOnce(key, array, object);
  };

  var decodeElement = function (symbol, object) {
    var variable = variables[symbol];

    if (variable.type === "array") {
      decodeArray(variable, symbol, object);
    }

    return object[symbol];
  };

  var assignOnce = function (key, value, object) {
    var assignedValue = object[key];
    var equalValues = _.isEqual(value, assignedValue);

    if (typeof assignedValue !== "undefined" && !equalValues) {
      var message = "The key '" + key + "' has conflicting assignments.";
      message += " It has been set to '" + assignedValue + "'";
      message += " and is now being set to '" + value + "'";

      throw new Error(message);
    } else {
      object[key] = value;
    }
  };

  var removeSupporting = function (object) {
    _.each(variables, function (variable, key) {
      if (variable.supporting) {
        delete object[key];
      }
    });
  };

  var typeName = function (value) {
    var t = typeof value;

    if (t === "boolean") {
      return "boolean";
    } else if (t === "number" && (value % 1) === 0) {
      return "integer";
    } else if (value && value.constructor === Array) {
      return "array";
    } else if (t === "object") {
      return "object";
    } else {
      throw new Error("Unknown type '" + t + "'");
    }
  };

  var typeIsAllowed = function (specifiedType, actualType) {
    if (specifiedType === actualType) {
      return true;
    } else if (specifiedType === "array" && actualType === "object") {
      return true;
    } else {
      return false;
    }
  };
};

Level3Runtime.encode = function (program, assignments) {
  return new Level3Runtime(program).encode(assignments);
};

Level3Runtime.decode = function (program, results) {
  return new Level3Runtime(program).decode(results);
};

module.exports = Level3Runtime;
