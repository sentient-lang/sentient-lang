"use strict";

var FunctionRegistry = function () {
  var self = this;
  var functions = {};

  self.register = function (name, args, body, returns, builtIn) {
    throwIfBuiltIn(name);

    functions[name] = {
      name: name,
      args: args,
      body: body,
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
