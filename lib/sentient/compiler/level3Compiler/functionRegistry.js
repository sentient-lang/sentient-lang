"use strict";

var FunctionRegistry = function () {
  var self = this;
  var functions = {};

  /* jshint maxparams: 6 */
  self.register = function (name, args, body, dynamic, returns, builtIn) {
    throwIfBuiltIn(name);

    functions[name] = {
      name: name,
      args: args,
      body: body,
      dynamic: dynamic,
      returns: returns,
      builtIn: builtIn
    };
  };

  self.get = function (name) {
    var fn = functions[name];

    if (typeof fn === "undefined") {
      throw new Error("Function '" + name + "' is not defined");
    }

    return fn;
  };

  var throwIfBuiltIn = function (name) {
    var existingFunction = functions[name];

    if (existingFunction && existingFunction.builtIn) {
      throw new Error("Unable to redefine builtin function '" + name + "'");
    }
  };
};

module.exports = FunctionRegistry;
