// This file is used as part of the build process (see Makefile).
//
// The CLI is attached to node's global object temporarily, if it is present.
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

  var SentientCLI = module.exports;
  global.SentientCLI = SentientCLI;
})();
