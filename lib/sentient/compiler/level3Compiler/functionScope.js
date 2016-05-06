"use strict";

var FunctionScope = function (contextRegistry, localRegistry) {
  var self = this;

  /* jshint maxparams: 7 */
  self.register = function (name, args, body, dynamic, immutable, returns) {
    throwIfImmutable(name);

    return localRegistry.register(
      name, args, body, dynamic, immutable, returns
    );
  };

  self.get = function (name) {
    return target(name).get(name);
  };

  self.contains = function (name) {
    return target(name).contains(name);
  };

  var target = function (name) {
    if (localRegistry.contains(name)) {
      return localRegistry;
    } else if (contextRegistry.contains(name)) {
      return contextRegistry;
    } else {
      return localRegistry;
    }
  };

  var throwIfImmutable = function (name) {
    if (!self.contains(name)) {
      return;
    }

    var fn = self.get(name);

    if (fn.immutable) {
      throw new Error("Unable to shadow immutable function '" + name + "'");
    }
  };
};

module.exports = FunctionScope;
