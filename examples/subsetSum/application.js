/* globals document */
/* jshint maxcomplexity:false */

"use strict";

var Application = function () {
  var self = this;
  var program;

  var aInput = document.getElementById("a");
  var bInput = document.getElementById("b");
  var cInput = document.getElementById("c");
  var dInput = document.getElementById("d");
  var eInput = document.getElementById("e");

  var totalInput = document.getElementById("total");

  self.run = function () {
    program = compileProgram();
    self.update();
  };

  self.update = function () {
    var assignments = {};

    if (aInput.value !== "?") { assignments.a = parseInt(aInput.value, 10); }
    if (bInput.value !== "?") { assignments.b = parseInt(bInput.value, 10); }
    if (cInput.value !== "?") { assignments.c = parseInt(cInput.value, 10); }
    if (dInput.value !== "?") { assignments.d = parseInt(dInput.value, 10); }
    if (eInput.value !== "?") { assignments.e = parseInt(eInput.value, 10); }

    if (totalInput.value !== "?") {
      assignments.total = parseInt(totalInput.value, 10);
    }

    var result = Sentient.run(program, assignments);

    aInput.style.borderColor = "red";
    bInput.style.borderColor = "red";
    cInput.style.borderColor = "red";
    dInput.style.borderColor = "red";
    eInput.style.borderColor = "red";
    totalInput.style.borderColor = "red";

    if (result.total) {
      aInput.value = result.a;
      bInput.value = result.b;
      cInput.value = result.c;
      dInput.value = result.d;
      eInput.value = result.e;
      totalInput.value = result.total;
    }

    if (result.aPresent) { aInput.style.borderColor = "#0c0"; }
    if (result.bPresent) { bInput.style.borderColor = "#0c0"; }
    if (result.cPresent) { cInput.style.borderColor = "#0c0"; }
    if (result.dPresent) { dInput.style.borderColor = "#0c0"; }
    if (result.ePresent) { eInput.style.borderColor = "#0c0"; }
    if (result.total) { totalInput.style.borderColor = "#0c0"; }
  };

  var compileProgram = function () {
    var program = {
      "metadata": {
        "title": "Subset Sum",
        "description": "Find a subset of N integers that add to a given total",
        "author": "Chris Patuzzo",
        "date": "2016-01-25"
      },
      "instructions": [
        { type: "integer", symbol: "a", width: 20 },
        { type: "integer", symbol: "b", width: 20 },
        { type: "integer", symbol: "c", width: 20 },
        { type: "integer", symbol: "d", width: 20 },
        { type: "integer", symbol: "e", width: 20 },

        { type: "boolean", symbol: "aPresent" },
        { type: "boolean", symbol: "bPresent" },
        { type: "boolean", symbol: "cPresent" },
        { type: "boolean", symbol: "dPresent" },
        { type: "boolean", symbol: "ePresent" },

        { type: "integer", symbol: "total", width: 20 },

        { type: "push", symbol: "aPresent" },
        { type: "push", symbol: "a" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "bPresent" },
        { type: "push", symbol: "b" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "cPresent" },
        { type: "push", symbol: "c" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "dPresent" },
        { type: "push", symbol: "d" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "push", symbol: "ePresent" },
        { type: "push", symbol: "e" },
        { type: "constant", value: 0 },
        { type: "if" },

        { type: "add" },
        { type: "add" },
        { type: "add" },
        { type: "add" },

        { type: "push", symbol: "total" },
        { type: "equal" },
        { type: "invariant" },

        { type: "variable", symbol: "a" },
        { type: "variable", symbol: "b" },
        { type: "variable", symbol: "c" },
        { type: "variable", symbol: "d" },
        { type: "variable", symbol: "e" },

        { type: "variable", symbol: "aPresent" },
        { type: "variable", symbol: "bPresent" },
        { type: "variable", symbol: "cPresent" },
        { type: "variable", symbol: "dPresent" },
        { type: "variable", symbol: "ePresent" },

        { type: "variable", symbol: "total" }
      ]
    };

    return Sentient.compile(program);
  };
};

window.Application = Application;
