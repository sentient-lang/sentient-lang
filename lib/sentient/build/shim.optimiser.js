// This file is used as part of the build process (see Makefile).
// We need to keep hold of this object before module.exports is reassigned.

(function () {
  "use strict";

  if (typeof module === "undefined") {
    return;
  }

  if (typeof module.exports === "undefined") {
    return;
  }

  if (typeof global === "undefined") {
    return;
  }

  global.SentientExports = global.SentientExports || {};
  global.SentientExports.Optimiser = module.exports;
})();
