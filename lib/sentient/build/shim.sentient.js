// This file is used as part of the build process (see Makefile).
//
// The exports are removed from node's global object and are bound to the
// Sentient module. If this file was run directly with node, run the CLI.
//
// https://nodejs.org/docs/latest/api/all.html#all_accessing_the_main_module

(function () {
  /* jshint maxcomplexity: 10 */
  "use strict";

  if (typeof window !== "undefined") {
    delete window.SentientExports;
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
  var SentientExports = global.SentientExports;

  var CLI = SentientExports.CLI;
  var Optimiser = SentientExports.Optimiser;

  Sentient.cli = new CLI(Sentient).run;
  Sentient.optimise = Optimiser.optimise;

  delete global.SentientExports;

  if (typeof require === "undefined") {
    return;
  }

  if (require.main !== module) {
    return;
  }

  Sentient.cli();
})();
