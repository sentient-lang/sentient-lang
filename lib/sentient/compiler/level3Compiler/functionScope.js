"use strict";

var FunctionScope = function (contextRegistry, localRegistry) {
  var self = this;
  var cache = {};

  /* jshint maxparams: 7 */
  self.register = function (name, args, body, dynamic, immutable, returns) {
    throwIfImmutable(name);
    delete cache[name];

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
    if (typeof cache[name] === "undefined") {
      if (localRegistry.contains(name)) {
        cache[name] = localRegistry;
      } else if (contextRegistry.contains(name)) {
        cache[name] = contextRegistry;
      } else {
        cache[name] = localRegistry;
      }
    }

    return cache[name];
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
