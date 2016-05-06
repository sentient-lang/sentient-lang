"use strict";

var FunctionRegistry = function () {
  var self = this;
  var functions = {};

  /* jshint maxparams: 7 */
  self.register = function (name, args, body, dynamic, immutable, returns) {
    throwIfImmutable(name);

    functions[name] = {
      name: name,
      args: args,
      body: body,
      dynamic: dynamic,
      immutable: immutable,
      returns: returns
    };
  };

  self.get = function (name) {
    var fn = functions[name];

    if (typeof fn === "undefined") {
      throw new Error("Function '" + name + "' is not defined");
    }

    return fn;
  };

  self.contains = function (name) {
    return typeof functions[name] !== "undefined";
  };

  var throwIfImmutable = function (name) {
    var existingFunction = functions[name];

    if (existingFunction && existingFunction.immutable) {
      throw new Error("Unable to redefine immutable function '" + name + "'");
    }
  };
};

module.exports = FunctionRegistry;
