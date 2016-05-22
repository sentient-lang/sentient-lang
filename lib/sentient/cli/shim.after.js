// This file is used as part of the build process (see Makefile).
//
// The CLI is removed from node's global object and is bound to the Sentient
// module. If this file was run directly with node, then run the CLI now.
//
// https://nodejs.org/docs/latest/api/all.html#all_accessing_the_main_module

(function () {
  /* jshint maxcomplexity: 10 */
  "use strict";

  if (typeof window !== "undefined") {
    delete window.SentientCLI;
  }

  if (typeof module === "undefined") {
    return;
  }

  if (typeof module.exports === "undefined") {
    return;
  }

  if (typeof global === "undefined") {
    return;
  }

  var Sentient = module.exports;
  var CLI = global.SentientCLI;

  Sentient.cli = new CLI(Sentient).run;
  delete global.SentientCLI;

  if (typeof require === "undefined") {
    return;
  }

  if (require.main !== module) {
    return;
  }

  Sentient.cli();
})();
